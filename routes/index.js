const express = require("express");
const Controller = require("../controllers/controller");

const router = express.Router();

// WELCOME / LOGIN
router.get("/", Controller.showWelcome);
router.get("/login", Controller.showWelcome);
router.post("/login", Controller.handleLogin);

// REGISTER
router.get("/register", Controller.showRegister);
router.post("/register", Controller.handleRegister);

// LOGOUT
router.get("/logout", Controller.handleLogout);

// HOME
router.get("/customer", Controller.showHomeCustomer);
router.get("/technician", Controller.showHomeTechnician);

// CUSTOMER FLOW
// Add Booking
router.get("/customer/bookings/add", Controller.showAddBooking);
router.post("/customer/bookings/add", Controller.handleAddBooking);

// Cart system
router.get("/customer/cart", Controller.showCart);
router.get("/customer/cart/:id/edit", Controller.showEditCartItem);
router.post("/customer/cart/:id/edit", Controller.handleEditCartItem);
router.post("/customer/cart/:id/delete", Controller.handleDeleteCartItem);
module.exports = router;
