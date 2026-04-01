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
  getOrderStats
} = require("../controllers/orderController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// USER ROUTES
router.post("/orders/create", authMiddleware, createOrder);
router.post("/orders/create-simple", authMiddleware, createSimpleOrder);
router.post("/orders/verify-payment", verifyPayment);
router.get("/orders/my", authMiddleware, getMyOrders);
router.get("/orders/:id", authMiddleware, getOrderById);
router.put("/orders/cancel/:id", authMiddleware, cancelOrder);

// ADMIN ROUTES
router.get("/orders/admin/all", authMiddleware, adminMiddleware, getAllOrders);
router.get("/orders/admin/stats", authMiddleware, adminMiddleware, getOrderStats);
router.put("/orders/admin/status/:id", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;