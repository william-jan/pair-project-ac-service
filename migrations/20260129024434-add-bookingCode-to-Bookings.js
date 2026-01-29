'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "bookingCode", {
      type: Sequelize.STRING,
      unique: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "bookingCode");
  }
};
