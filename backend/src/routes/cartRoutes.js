// routes/cartRoutes.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.get("/cart", authMiddleware, getCart);
router.post("/cart/add", authMiddleware, addToCart);
router.put("/cart/update/:productId", authMiddleware, updateCartItem);
router.delete("/cart/remove/:productId", authMiddleware, removeFromCart);
router.delete("/cart/clear", authMiddleware, clearCart);

module.exports = router;
