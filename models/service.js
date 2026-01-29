'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 belong to 1 technician
      Service.belongsTo(models.User, {
        foreignKey: "technicianId"
      });

      // services N-N bookings
      Service.belongsToMany(models.Booking, {
        through: models.BookingService,
        foreignKey: "serviceId",
        otherKey: "bookingId"
      });

      // for addition only 
      Service.hasMany(models.BookingService, {
        foreignKey: "serviceId"
      });

    }
  }
  Service.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    technicianId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Service',
  });
  return Service;
};