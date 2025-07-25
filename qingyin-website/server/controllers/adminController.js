const db = require('../models');
const bcrypt = require('bcryptjs');

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'isAdmin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

// 重置用户密码
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // 查找用户
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
    console.error('重置密码失败:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
};