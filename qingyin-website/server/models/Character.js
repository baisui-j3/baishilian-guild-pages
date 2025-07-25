const { DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

module.exports = (sequelize) => {
  const Character = sequelize.define('Character', {
    gameId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    signature: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      validate: {
        len: {
          args: [0, 50],
          msg: '个性签名不能超过50字'
        }
      }
    },
    screenshotPath: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      afterDestroy: async (character) => {
        if (character.screenshotPath) {
          const filePath = path.join(__dirname, '../../uploads', character.screenshotPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
  });

  Character.prototype.isOwner = function(userId) {
    return this.userId === userId;
  };

  Character.prototype.setApproval = function(isApproved) {
    this.isApproved = isApproved;
    return this.save();
  };

  Character.prototype.updateSignature = async function(newSignature) {
    this.signature = newSignature;
    
    if (this.isApproved) {
      this.isApproved = false;
    }
    
    return await this.save();
  };

  return Character;
};