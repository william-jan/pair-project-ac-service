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

      // M-M ke Service via BookingService
      Booking.belongsToMany(models.Service, {
        through: models.BookingService,
        foreignKey: "bookingId",
        otherKey: "serviceId"
      });

      
      Booking.hasMany(models.BookingService, {
        foreignKey: "bookingId"
      });

      Booking.belongsTo(models.TechnicianProfile, {
        foreignKey: "technicianprofileId"
      })

    }
  }
  Booking.init({
    customerId: DataTypes.INTEGER,
    technicianprofileId: DataTypes.INTEGER,
    scheduleDate:{
      type: DataTypes.DATE,
      allowNull:false,
      validate:{
        notNull: {
          msg: "scheduleDate required!"
        },
        notEmpty: {
          msg: "scheduleDate required!"
        },

      },
    },
    address:  {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull: {
          msg: "address required!"
        },
        notEmpty: {
          msg: "address required!"
        },
      },
    },
    status:  {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull: {
          msg: "status required!"
        },
        notEmpty: {
          msg: "status required!"
        },

      },
    },
    bookingCode:  {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull: {
          msg: "bookingCode required!"
        },
        notEmpty: {
          msg: "bookingCode required!"
        },

      },
    },
    service:  {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull: {
          msg: "service required!"
        },
        notEmpty: {
          msg: "service required!"
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });

  Booking.beforeValidate((booking) => {
    const now = Date.now();
    const rand = Math.floor(100 + Math.random() * 900)

    booking.bookingCode = `BK-${now}-${rand}`;
  });

  return Booking;
};

