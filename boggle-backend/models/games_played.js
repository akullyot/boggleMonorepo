'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Games_Played extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Games_Played.init({
    playedGameId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    seed: DataTypes.STRING,
    gameType: {type:DataTypes.ENUM,values:[
      '4x4',
      '5x5',
      '6x6'
    ]},
    diceType: {type:DataTypes.ENUM, values:[
      '4x4Classic',
      '4x4New',
      '5x5Classic',
      '6x6Classic'
    ]},
    secondsDuration: DataTypes.INTEGER,
    dictionaryUsed: {type: DataTypes.ENUM, values: [
      'scrabbleDictionary'
    ]},
    csvWordsList: DataTypes.STRING,
    datePlayed: DataTypes.DATE,
    wasMultiplayer: DataTypes.BOOLEAN,
    didWin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Games_Played',
  });
  return Games_Played;
};