const express = require("express");
const sendContactMail = require("../utils/sendContactMail");

const router = express.Router();

router.post("/contact/contact-us", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    await sendContactMail({ name, email, message });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

module.exports = router;
