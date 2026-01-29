'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookingServices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model:"Bookings", key:"id"},
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "Services", key:"id"},
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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
    await queryInterface.dropTable('BookingServices');
  }
};