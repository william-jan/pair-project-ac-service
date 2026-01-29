const {User, TechnicianProfile, Service, Booking, BookingService} = require("../models");

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

      const user = await User.authenticate(email, password);

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

}

module.exports = Controller;
