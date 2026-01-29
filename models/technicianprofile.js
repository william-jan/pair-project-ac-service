'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TechnicianProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // technicianprofile 1-1 user
      TechnicianProfile.belongsTo(models.User, {
        foreignKey: "userId"
      });

      TechnicianProfile.hasMany(models.Booking, {
        foreignKey: "technicianprofileId"
      })

    }
  }
  TechnicianProfile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notNull: {
          msg: "userId required!"
        },
        notEmpty: {
          msg: "userId required!"
        },
      },
    },
    companyName:{
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull: {
          msg: "companyName required!"
        },
        notEmpty: {
          msg: "companyName required!"
        },
      },
    },
    address: {
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
  }, {
    sequelize,
    modelName: 'TechnicianProfile',
  });
  return TechnicianProfile;
};