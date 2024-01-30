'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games_Played', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      playedGameId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      seed: {
        type: Sequelize.STRING,
        allowNull:false
      },
      gameType: {
        type: Sequelize.ENUM,
        allowNull:false,
        values: [
          '4x4',
          '5x5',
          '6x6'
        ]
      },
      diceType: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: [
          '4x4Classic',
          '4x4New',
          '5x5Classic',
          '6x6Classic'
        ]        
      },
      secondsDuration: {
        type: Sequelize.INTEGER,
        allowNull:true
      },
      dictionaryUsed: {
        type: Sequelize.ENUM,
        values: [
          'scrabbleDictionary'
          //TODO find APIs for more
        ]
      },
      csvWordsList: {
        type: Sequelize.STRING,
        allowNull: true
      },
      datePlayed: {
        type: Sequelize.DATE
      },
      wasMultiplayer: {
        type: Sequelize.BOOLEAN
      },
      didWin: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Games_Playeds');
  }
};