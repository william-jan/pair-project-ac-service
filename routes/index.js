const express = require("express");
const Controller = require("../controllers/controller");

const router = express.Router();

// WELCOME / LOGIN
router.get("/", Controller.showWelcome);
router.get("/login", Controller.showWelcome);
router.post("/login", Controller.handleLogin);

// REGISTER
router.get("/register", Controller.showRegister);
router.post("/register/customer", Controller.handleRegister);

// // LOGOUT
router.get("/logout", Controller.handleLogout);

// // HOME
router.get("/customer", Controller.showHomeCustomer);
router.get("/technician", Controller.showHomeTechnician);

// // CUSTOMER FLOW
// router.get("/bookings/add", Controller.showAddBooking);
// router.post("/bookings/add", Controller.handleAddBooking);

// router.get("/cart", Controller.showCart);
// router.post("/cart/checkout", Controller.handleCheckout);

// router.get("/payment", Controller.showPayment);

module.exports = router;
