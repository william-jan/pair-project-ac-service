const {User, TechnicianProfile, Service, Booking, BookingService} = require("../models");
const dayjsHelper = require("../helpers/dayjs");
const currencyHelper = require("../helpers/currency");
const {Op} = require("sequelize");

class Controller {

  
  static async showWelcome(req, res) {
    try {
      res.render("login");
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleLogin(req, res) {
    try {
      const {email, password} = req.body

      const user = await User.authenticate(email, password); // static method models/user.js

      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.name = user.name;

      if (user.role === "customer") return res.redirect("/customer");
      return res.redirect("/technician");

    } catch (error) {
      res.send(error.message)
    }
  }

  static async showRegister(req, res) {
    try {
      res.render("register")
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleRegister(req, res) {
    try {
      const {role, name, email, password, companyName, address} = req.body;
      const newUser = await User.create({
        name,
        email,
        password,
        role,
      })

      if (role === "technician") {
        await TechnicianProfile.create({
          userId: newUser.id,
          companyName,
          address,
        });
      }

      res.redirect("/login");
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleLogout(req, res) {
    try {
      req.session.destroy(() =>{
        res.redirect("login");
      })
    } catch (error) {
      res.send(error.message);
    }
  }

  static async showHomeCustomer(req, res) {
    try {
      if(!req.session.userId) return res.redirect("login");
      if(req.session.role != "customer") return res.redirect("/login");

      const {userId} = req.session;

      const bookings = await Booking.findAll({
        where: {customerId: userId},
        include: [
          {
            model: Service,
            through: {attributes: ["qty"]}, // take qty column
          }
        ],
        order: [["id", "ASC"]],
      });

      res.render("homecustomer", {
        bookings, 
        dayjs: dayjsHelper,
        currency: currencyHelper,
      });

    } catch (error) {
      res.send(error.message);
    }
  }

  static async showHomeTechnician(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "technician") return res.redirect("/login");

      const technicianId = req.session.userId;

      const rows = await BookingService.findAll({
        include: [
          {
            model: Service,
            where: {technicianId},
          },
          {
            model: Booking,
            include: [
              {
                model: User, // customer
              }
            ]
          }
        ],
        order: [["id", "DESC"]],
      });

      res.render("hometechnician", {
        rows,
        dayjs: dayjsHelper,
        currency: currencyHelper,
      });

    } catch (error) {
      res.send(error.message);
    }
  }
}

module.exports = Controller;