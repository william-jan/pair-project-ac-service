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

// Cart System
router.get("/customer/cart", Controller.showCart);
router.get("/customer/cart/:id/edit", Controller.showEditCartItem);
router.post("/customer/cart/:id/edit", Controller.handleEditCartItem);
router.post("/customer/cart/:id/delete", Controller.handleDeleteCartItem);

// Cart System (Payment)
router.post("/customer/cart/checkout", Controller.handleCheckout);
router.get("/customer/payment/success", Controller.showPaymentSuccess);

// TECHNICIAN FLOW
router.post("/technician/orders/update", Controller.handleUpdateOrderStatus);


router.get("/services", Controller.yourservice);
router.post("/services/add", Controller.handleAddService);
router.post("/services/delete", Controller.deleteservice);





module.exports = router;

