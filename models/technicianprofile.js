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
      models.TechnicianProfile.belongsTo(models.User, {
        foreignKey: "userId"
      });
    }
  }
  TechnicianProfile.init({
    userId: DataTypes.INTEGER,
    companyName: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TechnicianProfile',
  });
  return TechnicianProfile;
};