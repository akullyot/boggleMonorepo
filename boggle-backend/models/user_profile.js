'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User_Profile.init({
    profileId:{type: DataTypes.SMALLINT,primaryKey: true,autoIncrement: true},
    UserId: {type:DataTypes.INTEGER, allowNull:false},
    UserAvatarFilename: {type:DataTypes.STRING,allowNull:true},
    UserBio: {type:DataTypes.TEXT, allowNull:true}
  }, {
    sequelize,
    modelName: 'User_Profile',
  });
  return User_Profile;
};