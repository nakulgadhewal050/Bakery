const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String },
    phone: { type: String },
    code: { type: String, required: true },
    name: { type: String },
    password: { type: String },
    purpose: { type: String }, // null for register, "forgot-password" for reset

    expiresAt: {
      type: Date,
      default: () => Date.now() + 5 * 60 * 1000,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
