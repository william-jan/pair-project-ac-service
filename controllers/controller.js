const { User, TechnicianProfile, Service, Booking, BookingService } = require("../models");
const { formatDateTime } = require("../helpers/dayjs");
const currencyHelper = require("../helpers/currency");
const { Op } = require("sequelize");

class Controller {

  static async showWelcome(req, res) {
    try {
      const { errors } = req.query;
      res.render("login", { errors });
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
      res.redirect(`/login?errors=${error.message}`);
    }
  }

  static async showRegister(req, res) {
    try {
      const { errors } = req.query;
      res.render("register", { errors })
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleRegister(req, res) {
    try {
      const { role, name, email, password, companyName, address } = req.body;

      let errors = [];

      if (!name) errors.push("name required!");
      if (!email) errors.push("email required!");
      if (!password) errors.push("password required!");

      if (role === "technician") {
        if (!companyName) errors.push("company required!");
        if (!address) errors.push("address required!");
      }

      if (errors.length) {
        return res.redirect(`/register?errors=${errors.join(";")}`);
      }

      const newUser = await User.create({ name, email, password, role });

      if (role === "technician") {
        await TechnicianProfile.create({
          userId: newUser.id,
          companyName,
          address,
        });
      }

      res.redirect("/login");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        let errors = error.errors.map(el => el.message).join(";");
        return res.redirect(`/register?errors=${errors}`);
      }
      res.send(error.message);
    }
  }

  static async showHomeCustomer(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");
  
      const { userId } = req.session;
      const { bookingCode } = req.query;
  
      let where = {
        customerId: userId,
      };
  
      if (bookingCode) {
        where.bookingCode = {
          [Op.iLike]: `%${bookingCode}%`, 
        };
      }
  
      const bookings = await Booking.findAll({
        where,
        include: [
          {
            model: Service,
            through: { attributes: ["qty"] },
          },
        ],
        order: [["scheduleDate", "DESC"]],
      });
  
      res.render("homecustomer", {
        bookings,
        dayjs: formatDateTime,
        currency: currencyHelper,
        bookingCode, 
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

      const { serviceId, errors } = req.query;


      const servicesAll = await Service.findAll({
        order: [["name", "ASC"]],
      });


      let services = [];
      let seen = {};
      servicesAll.forEach((s) => {
        if (!seen[s.name]) {
          seen[s.name] = true;
          services.push({ id: s.id, name: s.name });
        }
      });


      let selectedServiceId = Number(serviceId);
      if (!selectedServiceId && services.length) selectedServiceId = services[0].id;


      let selectedName = null;
      if (selectedServiceId) {
        const picked = await Service.findByPk(selectedServiceId);
        if (picked) selectedName = picked.name;
      }


      let technicians = [];
      if (selectedName) {
        const rows = await Service.findAll({
          where: { name: selectedName },
          attributes: ["technicianId"],
        });

        const techUserIds = rows.map((r) => r.technicianId);

        technicians = await TechnicianProfile.findAll({
          where: { userId: { [Op.in]: techUserIds } },
          include: [User],
          order: [["id", "ASC"]],
        });
      }

      res.render("addbooking", {
        services,
        technicians,
        selectedServiceId,
        errors,
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleAddBooking(req, res) {
    try {
      if (!req.session.userId || req.session.role !== "customer") {
        return res.redirect("/login");
      }

      const userId = req.session.userId;
      const { serviceId, technicianprofileId, qty, scheduleDate, address } = req.body;


      const picked = await Service.findByPk(serviceId);
      if (!picked) return res.redirect("/customer/bookings/add");

      const serviceName = picked.name;


      const techProfile = await TechnicianProfile.findByPk(technicianprofileId);
      if (!techProfile) return res.redirect(`/customer/bookings/add?serviceId=${serviceId}`);

      const realService = await Service.findOne({
        where: {
          name: serviceName,
          technicianId: techProfile.userId,
        },
      });
      if (!realService) return res.redirect(`/customer/bookings/add?serviceId=${serviceId}`);


      const booking = await Booking.create({
        customerId: userId,
        technicianprofileId: techProfile.id,
        service: serviceName,
        scheduleDate,
        address,
        status: "waiting for payment",
      });

      // cart item
      await BookingService.create({
        bookingId: booking.id,
        serviceId: realService.id,
        qty: Number(qty) || 1,
      });

      res.redirect("/customer");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((e) => e.message).join(";");
        const { serviceId } = req.body;
        return res.redirect(`/customer/bookings/add?serviceId=${serviceId}&errors=${errors}`);
      }
      res.send(error.message);
    }
  }




  static async showCart(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { userId } = req.session;
      const { deleted } = req.query;
      const cartItems = await BookingService.findAll({
        attributes: ["id", "bookingId", "serviceId", "qty"], // <- id WAJIB ADA
        include: [
          {
            model: Booking,
            where: { customerId: userId, status: "waiting for payment" },
          },
          { model: Service },
        ],
        order: [["id", "ASC"]],
      });
      console.log(cartItems);

      res.render("cartpage", {
        cartItems,
        dayjs: formatDateTime,
        currency: currencyHelper.formatIDR, // biar di ejs: currency(angka)
        deleted,
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async showEditCartItem(req, res) {
    try {
      console.log("MASUK EDIT CART", req.params.id);
      const { errors } = req.query;
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { id } = req.params;  // <-- ID ada di sini!
      const { userId } = req.session;

      const item = await BookingService.findOne({
        where: { id },
        include: [
          {
            model: Booking,
            where: {
              customerId: userId,
              status: "waiting for payment",
            },
          },
          { model: Service },
        ],
        raw: true,
        nest: true,
      });

      if (!item) {
        return res.redirect("/customer/cart");
      }

      res.render("cartedit", {
        item,
        itemId: id,
        dayjs: formatDateTime,
        currency: currencyHelper.formatIDR,
        errors,
      });
    } catch (error) {
      res.send(error.message);
    }
  }

  static async handleEditCartItem(req, res) {
    const { id } = req.params;  //id BookingService
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");

      const { userId } = req.session;
      const { qty, scheduleDate, address } = req.body;

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
      if (error.name === "SequelizeValidationError") {
        let errors = error.errors.map((el) => el.message).join(";");
        res.redirect(`/customer/cart/${id}/edit?errors=${errors}`);
      } else {
        res.send(error);
      }
    }
  }

  static async handleDeleteCartItem(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "customer") return res.redirect("/login");
  
      const { id } = req.params; //id BookingService
      const item = await BookingService.findOne({
        where: { id },
        include: [
          { model: Service },
          { model: Booking }
        ]
      });
  
      if (!item) {
        return res.redirect("/customer/cart?deleted=Item not found");
      }
      await BookingService.destroy({ where: { id } });
      const message = `${item.Booking.bookingCode} (Qty: ${item.qty}) has been removed from cart`;
      res.redirect(`/customer/cart?deleted=${message}`);
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

      const row = await BookingService.findOne({
        where: { bookingId: Number(bookingId) },
        include: [
          { model: Service, where: { technicianId } },
          { model: Booking },
        ],
      });

      if (!row) return res.redirect("/technician");

      //  urutan status
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

  static async yourservice(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "technician") return res.redirect("/login");

      const technicianId = req.session.userId;

      // jasa yang sudah dimiliki teknisi
      const data = await Service.findAll({
        where: { technicianId },
        order: [["id", "ASC"]],
      });

      // sesuai service.json untuk layanan dan harga
      const master = [
        { name: "Cuci AC", price: 150000 },
        { name: "Isi Freon", price: 250000 },
        { name: "Bongkar Pasang", price: 300000 },
        { name: "Cek Kebocoran", price: 100000 },
      ];

      // filter yang belum dimiliki
      const ownedNames = data.map((s) => s.name);
      const available = master.filter((m) => !ownedNames.includes(m.name));

      res.render("yourservice", { data, available, currency: currencyHelper });
    } catch (error) {
      res.send(error.message);
    }
  }


  static async handleAddService(req, res) {
    try {
      if (!req.session.userId) return res.redirect("/login");
      if (req.session.role !== "technician") return res.redirect("/login");

      const technicianId = req.session.userId;
      const { name } = req.body;

      const master = {
        "Cuci AC": 150000,
        "Isi Freon": 250000,
        "Bongkar Pasang": 300000,
        "Cek Kebocoran": 100000,
      };

      const price = master[name];
      if (!price) return res.redirect("/services");

      // filter jasa teknisi
      const exist = await Service.findOne({ where: { technicianId, name } });
      if (exist) return res.redirect("/services");

      await Service.create({
        name,
        price,
        technicianId,
      });

      res.redirect("/services");
    } catch (error) {
      res.send(error.message);
    }
  }


  static async deleteservice(req, res) {
    try {
      const { serviceId } = req.body;

      await Service.destroy({
        where: { id: Number(serviceId) }
      });
      
      res.redirect("/services");
    } catch (error) {
      res.send(error);
    }
  }

  static async handleLogout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.send(err.message);
        }
        res.redirect("/login");
      });
    } catch (error) {
      res.send(error.message);
    }
  }

}

module.exports = Controller;
