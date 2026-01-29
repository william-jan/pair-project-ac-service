const { User, TechnicianProfile, Service, Booking, BookingService } = require("../models");
const { formatDateTime } = require("../helpers/dayjs");
const currencyHelper = require("../helpers/currency");
const { Op } = require("sequelize");

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
      const { email, password } = req.body

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
      const { role, name, email, password, companyName, address } = req.body;
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
      req.session.destroy(() => {
        res.redirect("/login");
      })
    } catch (error) {
      res.send(error.message);
    }
  }

  static async showHomeCustomer(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role != "customer") return res.redirect("/login");

      const { userId } = req.session;

      const bookings = await Booking.findAll({
        where: { customerId: userId },
        include: [
          {
            model: Service,
            through: { attributes: ["qty"] }, // take qty column
          }
        ],
        order: [["id", "ASC"]],
      });

      res.render("homecustomer", {
        bookings,
        dayjs: formatDateTime,
        currency: currencyHelper
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
            where: { technicianId },
          },
          {
            model: Booking,
            where: { status: { [Op.in]: ["pending", "accepted", "done"] } },
            include: [{ model: User }], // customer
          },
        ],
        order: [["id", "DESC"]],
      });

      res.render("hometechnician", { rows, dayjs: formatDateTime, currency: currencyHelper });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async showAddBooking(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const services = await Service.findAll({
        include: [
          {
            model: User,
            include: [TechnicianProfile],
          }
        ],
        order: [["id", "ASC"]],
      });

      res.render("addbooking", {
        services,
        dayjs: formatDateTime,
        currency: currencyHelper,
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleAddBooking(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");
  
      const { userId } = req.session;
      const { scheduleDate, address, qty, serviceId } = req.body;
  
      const serviceData = await Service.findByPk(serviceId);
      if (!serviceData) {
        return res.send("Service tidak ditemukan");
      }

      const booking = await Booking.create({
        customerId: userId,
        service: serviceData.name, 
        scheduleDate,
        address,
        status: "waiting for payment",
      });
  
      await BookingService.create({
        bookingId: booking.id,
        serviceId: serviceData.id,
        qty: Number(qty),
      });
  
      res.redirect("/customer");
  
    } catch (error) {
      res.send(error);
    }
  }
  


  static async showCart(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { userId } = req.session;

      const cartItems = await BookingService.findAll({
        include: [
          {
            model: Booking,
            where: { customerId: userId, status: "waiting for payment" },
          },
          { model: Service },
        ],
        order: [["id", "ASC"]],
      });

      res.render("cartpage", {
        cartItems,
        dayjs: formatDateTime,
        currency: currencyHelper
      });

    } catch (error) {
      res.send(error.message);
    }
  }

  static async showEditCartItem(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { id } = req.params; //id BookingService
      const { userId } = req.session;

      const item = await BookingService.findOne({
        where: { id },
        include: [
          {
            model: Booking,
            where: { customerId: userId, status: "waiting for payment" },
          },
          { model: Service },
        ]
      });

      res.render("cartEdit", {
        item,
        dayjs: dayjsHelper,
        currency: currencyHelper
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleEditCartItem(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { id } = req.params; //id BookingService
      const { userId } = req.session;
      const { qty, scheduleDate, address } = req.body;

      //update qty item
      await BookingService.update(
        { qty: Number(qty) },
        { where: { id } }
      );

      const item = await BookingService.findOne({
        where: { id },
        include: [
          {
            model: Booking,
            where: { customerId: userId, status: "waiting for payment" },
          }
        ]
      });

      if (item && item.Booking) {
        await Booking.update(
          { scheduleDate, address },
          { where: { id: item.Booking.id } }
        );
      };

      res.redirect("/customer/cart");

    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleDeleteCartItem(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { id } = req.params; //id BookingService

      await BookingService.destroy({ where: { id } });

      res.redirect("/customer/cart");
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleCheckout(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { userId } = req.session;

      const cartItems = await BookingService.findAll({
        include: [
          {
            model: Booking,
            where: { customerId: userId, status: "waiting for payment" },
          },
        ],
      });

      if (cartItems.length === 0) return res.redirect("/customer/cart");

      await Booking.update(
        { status: "pending" },
        { where: { customerId: userId, status: "waiting for payment" } }
      );

      res.redirect("/customer/payment/success");

    } catch (error) {
      res.send(error.message);
    }
  }

  static async showPaymentSuccess(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");
      res.render("payment");
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleUpdateOrderStatus(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "technician") return res.redirect("/login");

      const technicianId = req.session.userId;
      const { bookingId, status } = req.body;

      // Validasi simpel: booking ini memang punya service milik technician ini
      const row = await BookingService.findOne({
        where: { bookingId: Number(bookingId) },
        include: [
          { model: Service, where: { technicianId } },
          { model: Booking },
        ],
      });

      if (!row) return res.redirect("/technician");

      // Optional: enforce urutan status
      const current = row.Booking.status;
      if (current === "pending" && status !== "accepted") return res.redirect("/technician");
      if (current === "accepted" && status !== "done") return res.redirect("/technician");
      if (current === "done") return res.redirect("/technician");

      await Booking.update(
        { status },
        { where: { id: Number(bookingId) } }
      );

      res.redirect("/technician");
    } catch (error) {
      res.send(error.message);
    }
  }
}

module.exports = Controller;
