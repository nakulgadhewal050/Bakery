const express = require("express");
const router = express.Router();

const {
  createOrder,
  createSimpleOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  downloadInvoice
} = require("../controllers/orderController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// USER ROUTES
router.post("/orders/create", authMiddleware, createOrder);
router.post("/orders/create-simple", authMiddleware, createSimpleOrder);
router.post("/orders/verify-payment", verifyPayment);
router.get("/orders/my", authMiddleware, getMyOrders);


router.get("/orders/invoice/:id", authMiddleware, downloadInvoice);

// ADMIN ROUTES 
router.get("/orders/admin/all", authMiddleware, adminMiddleware, getAllOrders);
router.get("/orders/admin/stats", authMiddleware, adminMiddleware, getOrderStats);
router.put("/orders/admin/status/:id", authMiddleware, adminMiddleware, updateOrderStatus);


router.get("/orders/:id", authMiddleware, getOrderById);
router.put("/orders/cancel/:id", authMiddleware, cancelOrder);

module.exports = router;
// Stripe publishable key (no auth needed)
router.get("/orders/stripe-key", (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});