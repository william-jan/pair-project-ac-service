'use strict';
const bcrypt = require("bcryptjs");

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      // user 1-1 technicianprofiles
      User.hasOne(models.TechnicianProfile, {
        foreignKey: "userId"
      });

      // user technician 1-N services
      User.hasMany(models.Service, {
        foreignKey: "technicianId"
      });

      // user customer 1-N bookings
      User.hasMany(models.Booking, {
        foreignKey: "customerId"
      });

    }

    static async authenticate(email, password) {
      const user = await User.findOne({where: {email}});
      if (!user) throw new Error("Invalid email/password");

      const ok = bcrypt.compareSync(password, user.password);
      if (!ok) throw new Error("Invalid email/password");

      return user;
    }
    

  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate((user) => {
    user.password = bcrypt.hashSync(user.password, 8);
  });

  return User;
};