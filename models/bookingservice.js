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
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull: {
          msg: "BookingService required!"
        },
        notEmpty: {
          msg: "BookingService required!"
        },
      },
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull: {
          msg: "serviceId required!"
        },
        notEmpty: {
          msg: "serviceId required!"
        },
      },
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull: {
          msg: "qty required!"
        },
        notEmpty: {
          msg: "qty required!"
        },
      },
    },
  }, {
    sequelize,
    modelName: 'BookingService',
  });
  return BookingService;
};