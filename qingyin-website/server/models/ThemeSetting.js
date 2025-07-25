const { DataTypes } = require('sequelize');

// 允许的主题颜色列表
const ALLOWED_COLORS = ['pink', 'red', 'blue', 'yellow', 'cyan', 'purple', 'black'];

module.exports = (sequelize) => {
  const ThemeSetting = sequelize.define('ThemeSetting', {
    themeColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pink',
      validate: {
        isIn: {
          args: [ALLOWED_COLORS],
          msg: '无效的主题颜色'
        }
      }
    }
  }, {
    timestamps: true,
    createdAt: false,
    updatedAt: 'updatedAt',
    hooks: {
      beforeUpdate: (theme) => {
        // 确保只允许预定义的颜色
        if (!ALLOWED_COLORS.includes(theme.themeColor)) {
          theme.themeColor = 'pink';
        }
      }
    }
  });

  // 更新主题颜色方法
  ThemeSetting.prototype.updateColor = async function(color) {
    if (ALLOWED_COLORS.includes(color)) {
      this.themeColor = color;
      return await this.save();
    }
    return false;
  };

  // 获取当前主题颜色
  ThemeSetting.getCurrentTheme = async function() {
    const theme = await ThemeSetting.findOne();
    return theme ? theme.themeColor : 'pink';
  };

  return ThemeSetting;
};