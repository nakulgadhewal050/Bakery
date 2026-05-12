const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  img: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      name: String, phone: String,
      addressLine1: String, addressLine2: String,
      city: String, state: String, postalCode: String,
    },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true, default: 40 },
    paymentMethod: { type: String, enum: ["stripe", "cod", "wallet"], default: "stripe" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    stripe: {
      sessionId: String,
      paymentIntentId: String,
      amount: Number,
      currency: String,
    },
    orderStatus: {
      type: String,
      enum: ["created", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled", "returned"],
      default: "created",
    },
    paidAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);