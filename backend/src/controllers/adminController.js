const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const CustomCakeOrder = require("../models/CustomCakeOrder");
const Otp = require("../models/Otp");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateOTP = require("../utils/generateOTP");
const { sendOTPEmail } = require("../utils/sendOTP");

/* =====================================================
   HELPERS (MODEL SE SHIFT KIYA)
===================================================== */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = (entered, hashed) => {
  return bcrypt.compare(entered, hashed);
};

const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      isBlocked: admin.isBlocked,
    },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ================= SUPER ADMIN ================= */
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (!secretKey) {
      return res.status(400).json({ message: "Secret key is required" });
    }

    if (secretKey.trim() !== process.env.SUPER_ADMIN_SECRET.trim()) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "super-admin",
    });

    res.status(201).json({
      success: true,
      message: "Super admin registered successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin not found" });
    }

    if (admin.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Admin account blocked" });
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = generateAdminToken(admin);
    admin.password = undefined;

    res.json({ success: true, token, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMINS ================= */
exports.createAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) return res.status(400).json({ message: "Admin exists" });

  const hashedPassword = await hashPassword(password);

  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    role: role || "admin",
  });

  res.json({ success: true, admin });
};

exports.getAdmins = async (req, res) => {
  const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
  res.json({ success: true, admins });
};

exports.deleteAdmin = async (req, res) => {
  if (req.admin._id.toString() === req.params.id) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot delete yourself" });
  }

  await Admin.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* ================= PRODUCTS ================= */
exports.getAdminProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ success: true, products });
};

exports.createProduct = async (req, res) => {
  const images =
    req.cloudinaryFiles?.length > 0
      ? req.cloudinaryFiles
      : req.localFiles || [];

  const product = await Product.create({
    ...req.body,
    images,
    cloudinaryPublicIds: req.cloudinaryPublicIds || [],
  });

  res.status(201).json({ success: true, product });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, product });
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* ================= USERS ================= */
exports.getUsers = async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  const userIds = users.map((user) => user._id);

  const orderCounts = await Order.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: "$user", totalOrders: { $sum: 1 } } },
  ]);

  const orderCountMap = new Map(
    orderCounts.map((item) => [String(item._id), item.totalOrders])
  );

  const usersWithOrderCount = users.map((user) => ({
    ...user,
    totalOrders: orderCountMap.get(String(user._id)) || 0,
  }));

  res.json({ success: true, users: usersWithOrderCount });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.blockUnblockUser = async (req, res) => {
  const { blocked } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: blocked },
    { new: true }
  );

  res.json({
    success: true,
    message: blocked ? "User blocked" : "User unblocked",
    user,
  });
};

/* ================= ORDERS ================= */
exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json({ success: true, orders });
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: status },
    { new: true }
  );

  res.json({ success: true, order });
};

exports.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* ================= PROFILE ================= */
exports.getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select("-password");
  res.json({ success: true, admin });
};

exports.updateAdminProfile = async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(req.admin._id, req.body, {
    new: true,
  }).select("-password");

  res.json({ success: true, admin });
};

exports.uploadAdminProfilePic = async (req, res) => {
  const profilePicture = req.cloudinaryFiles[0];

  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    { profilePicture },
    { new: true }
  ).select("-password");

  res.json({ success: true, profilePicture: admin.profilePicture });
};

/* ================= FORGOT / RESET ================= */
exports.adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();

  await Otp.create({
    email,
    code: String(otp),
    purpose: "admin-forgot-password",
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOTPEmail(email, otp);

  res.json({ success: true, message: "OTP sent" });
};

exports.adminResetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedPassword = await hashPassword(newPassword);

  await Admin.findOneAndUpdate({ email }, { password: hashedPassword });

  await Otp.deleteMany({ email, purpose: "admin-forgot-password" });

  res.json({ success: true, message: "Password reset successful" });
};

exports.adminVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({
    email,
    code: String(otp),
    purpose: "admin-forgot-password",
    expiresAt: { $gt: Date.now() },
  });

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ success: true, message: "OTP verified" });
};
