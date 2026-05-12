const express = require("express");
const Newsletter = require("../models/Newsletter");
const sendNewsletterMail = require("../utils/sendNewsletterMail");

const router = express.Router();

// Subscribe to newsletter
router.post("/newsletter/subscribe", async (req, res) => {
  const normalizedEmail = req.body.email?.toLowerCase();

  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({
      email: normalizedEmail,
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: "This email is already subscribed!",
        });
      } else {
        // Reactivate if previously unsubscribed
        existingSubscriber.isActive = true;
        existingSubscriber.unsubscribedAt = null;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();

        await sendNewsletterMail({ email: normalizedEmail, isResubscribe: true });

        return res.status(200).json({
          success: true,
          message: "Welcome back! You've been resubscribed to our newsletter.",
        });
      }
    }

    // Create new subscriber
    const newSubscriber = new Newsletter({
      email: normalizedEmail,
    });

    await newSubscriber.save();

    await sendNewsletterMail({ email: normalizedEmail });

    res.status(201).json({
      success: true,
      message: "🎉 Successfully subscribed! Check your email for updates.",
    });
  } catch (error) {
    console.error("❌ Newsletter subscription error:", {
      message: error.message,
      code: error.code,
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed!",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Unsubscribe from newsletter
router.post("/newsletter/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        isActive: false,
        unsubscribedAt: new Date(),
      },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our subscriber list",
      });
    }

    res.status(200).json({
      success: true,
      message: "You have been unsubscribed from our newsletter.",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again later.",
    });
  }
});

// Get total subscribers (admin use)
router.get("/newsletter/subscribers-count", async (req, res) => {
  try {
    const count = await Newsletter.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers: count,
      },
    });
  } catch (error) {
    console.error("Newsletter count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriber count",
    });
  }
});

module.exports = router;
