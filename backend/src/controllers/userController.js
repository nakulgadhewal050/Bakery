const User = require("../models/User");
const fs = require("fs");

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, username } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPLOAD PROFILE PIC ================= */
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);

    user.profilePicture = `/${req.file.path.replace(/\\/g, "/")}`;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture uploaded",
      profilePicture: user.profilePicture,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= REMOVE PROFILE PIC ================= */
exports.removeProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.profilePicture)
      return res.status(400).json({ message: "No profile picture to remove" });

    const filePath = user.profilePicture.replace("/", "");

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.profilePicture = "";
    await user.save();

    res.json({
      success: true,
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE ACCOUNT ================= */
exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADD ADDRESS ================= */
exports.addAddress = async (req, res) => {
  try {
    const { street, city, state, pincode } = req.body;

    if (!street || !city || !state || !pincode)
      return res.status(400).json({ message: "All address fields required" });

    const user = await User.findById(req.user.id);

    user.address = { street, city, state, pincode };
    await user.save();

    res.json({
      success: true,
      message: "Address added successfully",
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE ADDRESS ================= */
exports.updateAddress = async (req, res) => {
  try {
    const { street, city, state, pincode } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address.street = street || user.address.street;
    user.address.city = city || user.address.city;
    user.address.state = state || user.address.state;
    user.address.pincode = pincode || user.address.pincode;

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADD PHONE ================= */
exports.addPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone)
      return res.status(400).json({ message: "Phone number required" });

    const user = await User.findById(req.user.id);

    user.phone = phone;
    await user.save();

    res.json({
      success: true,
      message: "Phone number updated successfully",
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
