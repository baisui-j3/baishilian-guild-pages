const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');

module.exports = {
  authenticate: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      jwt.verify(token, process.env.JWT_SECRET || 'qingyin_secret', (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: '无效的认证令牌' });
        }
        
        req.userId = decoded.id;
        next();
      });
    } else {
      res.status(401).json({ error: '未提供认证令牌' });
    }
  },
  
  isAdmin: async (req, res, next) => {
    try {
      const user = await db.User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ error: '需要管理员权限' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('管理员权限检查错误:', error);
      res.status(500).json({ error: '权限检查失败' });
    }
  },
  
  validateRegister: (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' });
    }
    
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需在2-20字符之间' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6个字符' });
    }
    
    next();
  },
  
  validateLogin: (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' });
    }
    
    next();
  },
  
  validatePassword: (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码是必填项' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度至少为6个字符' });
    }
    
    next();
  }
};