'use strict';
const fs = require("fs").promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = JSON.parse(await fs.readFile("./data/bookingservices.json", "utf8")).map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("BookingServices", data);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("BookingServices", null, {});
  }
};
