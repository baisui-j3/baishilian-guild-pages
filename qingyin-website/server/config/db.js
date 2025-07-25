const path = require('path');
const { Sequelize } = require('sequelize');
const mkdirp = require('mkdirp');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// 确保数据库目录存在
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  mkdirp.sync(dbDir);
}

// 创建并配置数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dbDir, 'qingyin.db'),
  logging: false, // 关闭控制台日志输出
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功!');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  }
}

// 初始化数据库函数
async function initDatabase() {
  try {
    // 导入所有模型
    const db = require('../models');
    
    // 同步所有模型到数据库
    await db.sequelize.sync({ force: true });
    console.log('📚 数据库表已创建');
    
    // 创建默认管理员账户
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin', salt);
    
    await db.User.create({
      username: 'admin',
      password: hashedPassword,
      isAdmin: true
    });
    
    console.log('🔑 管理员账户 admin/admin 已创建');
    
    // 初始化主题设置
    await db.ThemeSetting.create({
      themeColor: 'pink'
    });
    
    console.log('🎨 默认主题设置 (粉色) 已创建');
    
    // 创建测试用户（仅开发环境）
    if (process.env.NODE_ENV !== 'production') {
      const testPassword = bcrypt.hashSync('test123', salt);
      const testUser = await db.User.create({
        username: 'testuser',
        password: testPassword
      });
      
      // 创建测试角色
      await db.Character.create({
        userId: testUser.id,
        gameId: '测试角色',
        signature: '这是一个测试签名',
        isApproved: true
      });
      
      console.log('👤 测试用户 testuser/test123 已创建');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  }
}

module.exports = {
  sequelize,
  testConnection,
  initDatabase
};