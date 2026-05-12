const express = require("express");
const sendContactMail = require("../utils/sendContactMail");

const router = express.Router();

router.post("/contact/contact-us", async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    console.warn("❌ Contact form - Missing fields:", { name: !!name, email: !!email, message: !!message });
    return res.status(400).json({
      success: false,
      message: "All fields (name, email, message) are required",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn("❌ Contact form - Invalid email:", email);
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  // Message length validation
  if (message.trim().length < 10) {
    console.warn("❌ Contact form - Message too short:", message.length);
    return res.status(400).json({
      success: false,
      message: "Message must be at least 10 characters long",
    });
  }

  try {
    console.log("📧 Attempting to send contact email from:", email);
    await sendContactMail({ name, email, message });
    console.log("✅ Contact email sent successfully from:", email);

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("❌ Contact form error:", {
      message: error.message,
      email: email,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
