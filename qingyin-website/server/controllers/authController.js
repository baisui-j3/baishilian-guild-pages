const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const path = require('path');
const fs = require('fs');

// 管理员用户名的特殊处理
const ADMIN_USERNAME = 'admin';

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 加密密码
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    // 创建新用户
    const newUser = await db.User.create({
      username,
      password: hashedPassword,
      isAdmin: false
    });
    
    res.status(201).json({ 
      message: '注册成功！', 
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('用户注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await db.User.findOne({ 
      where: { username },
      attributes: ['id', 'username', 'password', 'isAdmin']
    });
    
    // 验证用户是否存在
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 创建JWT
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin }, 
      process.env.JWT_SECRET || 'qingyin_secret',
      { expiresIn: '7d' }
    );
    
    // 对管理员用户显示特殊消息
    let message = '登录成功！';
    if (user.username === ADMIN_USERNAME) {
      message = '欢迎回来，帮主！';
    }
    
    res.status(200).json({
      message,
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('用户登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.userId, {
      attributes: ['id', 'username', 'isAdmin', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 查找用户
    const user = await db.User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 验证当前密码
    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: '当前密码不正确' });
    }
    
    // 加密新密码
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    
    // 更新密码
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: '密码修改成功！' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '密码修改失败' });
  }
};

// 管理员重置用户密码
exports.resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // 检查当前用户是否是管理员
    const currentUser = await db.User.findByPk(req.userId);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ error: '需要管理员权限' });
    }
    
    // 查找目标用户
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 生成随机密码（如果未提供）
    let password = newPassword;
    if (!password) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    // 加密新密码
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    // 更新密码
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ 
      message: '密码重置成功！',
      newPassword: password
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
};

// 注销账户
exports.deleteAccount = async (req, res) => {
  try {
    // 删除用户所有角色（会触发删除截图钩子）
    await db.Character.destroy({ where: { userId: req.userId } });
    
    // 删除用户
    await db.User.destroy({ where: { id: req.userId } });
    
    res.status(200).json({ message: '账户已成功注销' });
  } catch (error) {
    console.error('注销账户错误:', error);
    res.status(500).json({ error: '注销账户失败' });
  }
};