'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
       const tables = [
      "Users",
      "TechnicianProfiles",
      "Services",
      "Bookings",
      "BookingServices",
    ];

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      await queryInterface.sequelize.query(`
        SELECT setval(
          pg_get_serial_sequence('"${table}"', 'id'),
          (
            SELECT CASE
              WHEN MAX(id) IS NULL THEN 1
              ELSE MAX(id) + 1
            END
            FROM "${table}"
          ),
          false
        );
      `);
    }

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
