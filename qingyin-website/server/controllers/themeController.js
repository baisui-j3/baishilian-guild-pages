const db = require('../models');

// 允许的主题颜色列表
const ALLOWED_COLORS = ['pink', 'red', 'blue', 'yellow', 'cyan', 'purple', 'black'];

// 获取当前主题设置
exports.getTheme = async (req, res) => {
  try {
    // 查找主题设置（只应有一条记录）
    const theme = await db.ThemeSetting.findOne();
    
    // 如果没有找到主题设置，创建默认设置
    if (!theme) {
      const defaultTheme = await db.ThemeSetting.create({
        themeColor: 'pink'
      });
      return res.status(200).json({ themeColor: defaultTheme.themeColor });
    }
    
    res.status(200).json({ themeColor: theme.themeColor });
  } catch (error) {
    console.error('获取主题失败:', error);
    res.status(500).json({ error: '获取主题失败' });
  }
};

// 更新主题设置
exports.updateTheme = async (req, res) => {
  try {
    const { themeColor } = req.body;
    
    // 验证输入的颜色是否有效
    if (!ALLOWED_COLORS.includes(themeColor)) {
      return res.status(400).json({ error: '无效的主题颜色' });
    }
    
    // 查找现有的主题设置
    let theme = await db.ThemeSetting.findOne();
    
    // 如果没有主题设置，创建新的
    if (!theme) {
      theme = await db.ThemeSetting.create({ themeColor });
    } else {
      // 更新现有主题设置
      theme.themeColor = themeColor;
      await theme.save();
    }
    
    res.status(200).json({ 
      message: '主题更新成功', 
      themeColor: theme.themeColor 
    });
  } catch (error) {
    console.error('更新主题失败:', error);
    res.status(500).json({ error: '更新主题失败' });
  }
};