const express = require("express");
const router = express.Router();
const {
  uploadMemory,
  handleCloudinaryUpload,
} = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminMiddleware");
const superAdminAuth = require("../middlewares/superAdminAuth");

const adminController = require("../controllers/adminController");

/* ===== AUTH ===== */
router.post("/admin/super-admin/register", adminController.registerSuperAdmin);
router.post("/admin/login", adminController.adminLogin);

/* ===== ADMIN PROFILE ===== */
router.get("/admin/me", adminAuth, adminController.getAdminProfile);
router.put(
  "/admin/update-profile/:id",
  adminAuth,
  adminController.updateAdminProfile
);
router.put(
  "/admin/upload-profile-pic",
  adminAuth,
  uploadMemory.single("profilePic"),
  handleCloudinaryUpload,
  adminController.uploadAdminProfilePic
);

/* ===== ADMIN MANAGEMENT ===== */
router.post("/admin/create", superAdminAuth, adminController.createAdmin);
router.get("/admin/admins", superAdminAuth, adminController.getAdmins);
router.delete("/admin/:id", superAdminAuth, adminController.deleteAdmin);

/* ===== PRODUCTS ===== */
router.get("/admin/products", adminAuth, adminController.getAdminProducts);
router.post(
  "/admin/product",
  adminAuth,
  uploadMemory.array("images", 10),
  handleCloudinaryUpload,
  adminController.createProduct
);
router.put("/admin/product/:id", adminAuth, adminController.updateProduct);
router.delete("/admin/product/:id", adminAuth, adminController.deleteProduct);

/* ===== USERS ===== */
router.get("/admin/users", adminAuth, adminController.getUsers);
router.patch(
  "/admin/user/block/:id",
  adminAuth,
  adminController.blockUnblockUser
);
router.delete("/admin/user/:id", adminAuth, adminController.deleteUser);

/* ===== ORDERS ===== */
router.get("/admin/orders", adminAuth, adminController.getOrders);
router.put(
  "/admin/orders/:id/status",
  adminAuth,
  adminController.updateOrderStatus
);
router.delete("/admin/orders/:id", adminAuth, adminController.deleteOrder);
router.post("/admin/forgot-password", adminController.adminForgotPassword);
router.put("/admin/reset-password", adminController.adminResetPassword);
router.post("/admin/verify-otp", adminController.adminVerifyOtp);
module.exports = router;
