'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Auth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({User_Friendship, User_Profile}) {
      User_Auth.hasMany(User_Friendship, {
        foreignKey:'userId',
        as:'friendshipOneRelation'
      });
      User_Auth.hasMany(User_Friendship, {
        foreignKey: 'userId',
        as: 'friendshipTwoRelation'
      });
      User_Auth.hasOne(User_Profile, {
        foreignKey:'userId',
        as: 'userProfileInformation'
      })
    }
  }
  User_Auth.init({
    userId: {type: DataTypes.SMALLINT,primaryKey: true,autoIncrement: true},
    username:{type: DataTypes.STRING, allowNull: false}, //TODO make some rules on acceptable logins
    firstName:{type: DataTypes.STRING, allowNull: false},
    lastName: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, allowNull: true},
    passwordDigest: {type: DataTypes.STRING, allowNull: false},
    dateRegistered:{type:DataTypes.DATE, allowNull:false},
    lastLogin:{type:DataTypes.DATE, allowNull:false}//,
    //possible additions
    //isEmailVerified
    //isActive
  }, {
    sequelize,
    modelName: 'User_Auth',
  });
  return User_Auth;
};