require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mkdirp = require('mkdirp');
const { testConnection, initDatabase } = require('./config/db');

// 创建必要的目录
mkdirp.sync('server/uploads');
mkdirp.sync('server/signatures');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/signatures', express.static(path.join(__dirname, 'signatures')));

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '清音帮会后端服务运行中' });
});

// 配置路由
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const characterRoutes = require('./routes/characterRoutes');
app.use('/api', characterRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const themeRoutes = require('./routes/themeRoutes');
app.use('/api/theme', themeRoutes);

// 启动服务器
const PORT = process.env.PORT || 5000;

// 初始化数据库后启动服务器
async function startServer() {
  await testConnection();
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('❌ 服务器启动失败:', err);
  process.exit(1);
});

module.exports = app;