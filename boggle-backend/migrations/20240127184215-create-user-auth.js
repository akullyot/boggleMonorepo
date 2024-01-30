'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User_Auths', {
      userId: {type: Sequelize.SMALLINT,primaryKey: true, autoIncrement: true},
      username:{type: Sequelize.STRING, allowNull: false}, //TODO make some rules on acceptable logins
      firstName:{type: Sequelize.STRING, allowNull: false},
      lastName: {type: Sequelize.STRING, allowNull: true},
      email: {type: Sequelize.STRING, allowNull: true},
      passwordDigest: {type: Sequelize.STRING, allowNull: false},
      dateRegistered:{type:Sequelize.DATE, allowNull:false},
      lastLogin:{type:Sequelize.DATE, allowNull:false},
      //THESE ARE REQUIRED TO HAVE SEQUELIZE WORK CURRENTLY FOR EVERY TABLE
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }//,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('User_Auths');
  }
};