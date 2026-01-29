'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //table helper + quantity

      BookingService.belongsTo(models.Booking, {
        foreignKey: "bookingId"
      });

      BookingService.belongsTo(models.Service, {
        foreignKey: "serviceId"
      });
    }
  }
  BookingService.init({
    bookingId: DataTypes.INTEGER,
    serviceId: DataTypes.INTEGER,
    qty: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BookingService',
  });
  return BookingService;
};