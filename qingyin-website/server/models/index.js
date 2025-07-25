const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require('../config/db');
const db = {};

const sequelize = config.sequelize;

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('test')
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.User.hasMany(db.Character, { 
  foreignKey: 'userId',
  as: 'characters',
  onDelete: 'CASCADE' 
});

db.Character.belongsTo(db.User, { 
  foreignKey: 'userId',
  as: 'user'
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;