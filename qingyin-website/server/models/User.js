const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: async (user) => {
        if (user.isAdmin) return;
      }
    }
  });

  User.prototype.validPassword = function(password) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compareSync(password, this.password);
  };

  User.prototype.getCharacters = async function() {
    return await sequelize.models.Character.findAll({
      where: { userId: this.id }
    });
  };

  User.prototype.getRejectedSignatures = async function() {
    return await sequelize.models.Character.findAll({
      where: {
        userId: this.id,
        isApproved: false,
        signature: { [sequelize.Sequelize.Op.ne]: null }
      }
    });
  };

  return User;
};