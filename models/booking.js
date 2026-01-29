'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // booking dibuat langsung oleh customer
      Booking.belongsTo(models.User, {
        foreignKey: "customerId"
      });

      // M-N ke Service via BookingService
      Booking.belongsToMany(models.Service, {
        through: models.BookingService,
        foreignKey: "bookingId",
        otherKey: "serviceId"
      });

      
      Booking.hasMany(models.BookingService, {
        foreignKey: "bookingId"
      });

    }
  }
  Booking.init({
    customerId: DataTypes.INTEGER,
    scheduleDate: DataTypes.DATE,
    address: DataTypes.STRING,
    status: DataTypes.STRING,
    bookingCode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });

  Booking.beforeCreate((booking) => {
    const now = Date.now();
    const rand = Math.floor(100 + Math.random() * 900)

    booking.bookingCode = `BK-${now}-${rand}`;
  });

  return Booking;
};