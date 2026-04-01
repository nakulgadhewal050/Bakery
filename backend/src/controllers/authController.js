const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { sendOTPEmail } = require("../utils/sendOTP");
const generateOTP = require("../utils/generateOTP");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  let { name, email, password, phone } = req.body;

  if (email) {
    email = email.toLowerCase().trim();
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Already registered" });

    const otp = generateOTP();
    let emailSent = false;
    if (email) emailSent = await sendOTPEmail(email, otp);
    console.log("OTP STATUS:", { emailSent });
    if (email && !emailSent) {
      return res.status(503).json({
        success: false,
        message: "OTP delivery failed. Please try again in a moment.",
      });
    }

    await Otp.create({
      email,
      phone,
      name,
      password,
      code: otp,
      purpose: "register",
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= SEND OTP ================= */
exports.sendOtp = async (req, res) => {
  const { email, phone, purpose = "register" } = req.body;

  const otp = generateOTP();

  let emailSent = false;

  if (email) emailSent = await sendOTPEmail(email, otp);

  console.log("OTP STATUS:", { emailSent });

  if (email && !emailSent) {
    return res.status(503).json({
      success: false,
      message: "OTP delivery failed. Please try again in a moment.",
    });
  }

  await Otp.create({
    email,
    phone,
    code: otp,
    purpose,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  res.json({ success: true, message: "OTP sent successfully" });
};

/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP required",
      });
    }
    console.log("VERIFY BODY:", req.body);
    // 🔥 Normalize OTP
    const normalizedOtp = String(otp).trim();

    const query = {
      code: normalizedOtp,
      expiresAt: { $gt: Date.now() },
    };

    if (email) query.email = email.toLowerCase().trim();
    if (purpose) query.purpose = purpose.trim();

    // 🔍 DEBUG (temporary)
    console.log("OTP VERIFY QUERY:", query);

    const record = await Otp.findOne(query).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
      purpose: record.purpose,
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

/* ================= SET USERNAME ================= */
exports.setUsername = async (req, res) => {
  try {
    const { username, email, phone } = req.body;

    if (!username || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // 🔥 ONLY OTP WITH PASSWORD
    const otpRecord = await Otp.findOne({
      $or: [{ email }, { phone }],
      purpose: "register",
      password: { $exists: true },
      expiresAt: { $gt: Date.now() },
    }).sort({ createdAt: -1 });
    console.log("OTP RECORD FOUND:", otpRecord);

    if (!otpRecord || !otpRecord.password) {
      return res.status(400).json({
        success: false,
        message: "Registration expired. Please register again.",
      });
    }

    const hashedPassword = await bcrypt.hash(String(otpRecord.password), 10);

    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      phone: otpRecord.phone,
      username,
      password: hashedPassword,
      emailVerified: true,
    });

    await Otp.deleteMany({
      $or: [{ email }, { phone }],
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Registration complete",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ setUsername error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete registration",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // cheking if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: "Account blocked",
    });
  }

  // comparing password
  const isMatch = await user.comparePassword(String(password));
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Incorrect password",
    });
  }

  const token = user.generateJWT();

  res.cookie("userToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.json({
    success: true,
    message: "Login successful",
    token,
    user,
  });
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (email) {
      email = email.toLowerCase().trim();
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOTP();

    // delete old OTPs for this email
    await Otp.deleteMany({ email, purpose: "forgot-password" });

    console.log("CREATING FORGOT OTP:", email, otp);

    // SAVE FIRST (IMPORTANT)
    await Otp.create({
      email,
      code: otp,
      purpose: "forgot-password",
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // SEND EMAIL AFTER SAVING
    const sent = await sendOTPEmail(email, otp);
    if (!sent) {
      return res.status(200).json({
        success: true,
        message:
          "OTP generated, but email delivery is delayed. Please check again shortly.",
      });
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "Passwords mismatch" });

  const otpRecord = await Otp.findOne({ email, purpose: "forgot-password" });
  if (!otpRecord)
    return res.status(400).json({ success: false, message: "OTP expired" });

  const user = await User.findOne({ email });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteMany({ email });

  res.json({ success: true, message: "Password reset successful" });
};

/* ================= LOGOUT ================= */
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
