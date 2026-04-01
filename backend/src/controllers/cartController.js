// controllers/cartController.js

const User = require("../models/User");
const Product = require("../models/Product");

/**
 * Fetch the logged-in user's cart
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate(
      "cart.productId",
      "name price images stock"
    );

    if (!user) {
      return res.status(404).json({ message: "Unable to find user account" });
    }

    return res.json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

/**
 * Add an item to the cart
 * POST /api/cart/add
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < 1) {
      return res
        .status(400)
        .json({ message: "Product is currently out of stock" });
    }

    const user = await User.findById(req.user.id);

    const existingIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    // If product already exists in cart → update qty
    if (existingIndex !== -1) {
      const updatedQty = user.cart[existingIndex].quantity + Number(qty);

      if (updatedQty > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} item(s) available in stock`,
        });
      }

      user.cart[existingIndex].quantity = updatedQty;
      user.cart[existingIndex].addedAt = new Date();
    } else {
      // Add new product in cart
      if (qty > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} item(s) available in stock`,
        });
      }

      user.cart.push({
        productId,
        quantity: Number(qty),
        addedAt: new Date(),
      });
    }

    await user.save();

    const cartAfterUpdate = await User.findById(req.user.id).populate(
      "cart.productId",
      "name price images stock"
    );

    res.json({ success: true, cart: cartAfterUpdate.cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add item to cart", error: error.message });
  }
};

/**
 * Update item quantity in cart
 * PUT /api/cart/update/:productId
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} item(s) available`,
      });
    }

    const user = await User.findById(req.user.id);

    const itemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item is not present in cart" });
    }

    user.cart[itemIndex].quantity = Number(quantity);
    user.cart[itemIndex].addedAt = new Date();

    await user.save();

    const updatedCart = await User.findById(req.user.id).populate(
      "cart.productId",
      "name price images stock"
    );

    res.json({ success: true, cart: updatedCart.cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not update quantity", error: error.message });
  }
};

/**
 * Remove a single product from the cart
 * DELETE /api/cart/remove/:productId
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    const initialLength = user.cart.length;

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    if (user.cart.length === initialLength) {
      return res
        .status(404)
        .json({ message: "Item not found inside the cart" });
    }

    await user.save();

    const updatedCart = await User.findById(req.user.id).populate(
      "cart.productId",
      "name price images stock"
    );

    res.json({ success: true, cart: updatedCart.cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove item", error: error.message });
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart/clear
 */
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = [];
    await user.save();

    res.json({ success: true, cart: [] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to clear cart", error: error.message });
  }
};
