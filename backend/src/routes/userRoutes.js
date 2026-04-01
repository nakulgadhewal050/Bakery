const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/profile-pics";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.user.id + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/* ================= ROUTES ================= */

// Profile
router.put("/user/update-profile/:id", protect, userController.updateProfile);
router.put(
  "/user/upload-profile-pic",
  protect,
  upload.single("profilePic"),
  userController.uploadProfilePic
);

router.delete(
  "/user/remove-profile-pic",
  protect,
  userController.removeProfilePic
);

// Address
router.post("/user/add-address", protect, userController.addAddress);
router.put("/user/update-address", protect, userController.updateAddress);

// Phone
router.patch("/user/add-phone", protect, userController.addPhone);

// Account
router.delete(
  "/user/delete-account",
  protect,
  userController.deleteAccount
);

module.exports = router;
