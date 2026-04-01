const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔐 Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.role && decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Please login with a user account",
      });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again.",
      });
    }

    req.user = user;
    console.log("✅ Authenticated User:", user._id);

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
