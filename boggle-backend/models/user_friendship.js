'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Friendship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User_Friendship.init({
    friendshipId:{type: DataTypes.SMALLINT,primaryKey: true,autoIncrement: true},
    friendOneId: {type: DataTypes.INTEGER, allowNull: false},
    friendTwoId: {type: DataTypes.INTEGER, allowNull: false},
    isPending: {type: DataTypes.INTEGER, allowNull: false}
  }, {
    sequelize,
    modelName: 'User_Friendship',
  });
  return User_Friendship;
};