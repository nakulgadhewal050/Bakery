const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => process.env.JWT_SECRET || "default_jwt_secret";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log(`🔐 Auth Check | Header: ${authHeader ? "✅ PRESENT" : "❌ MISSING"}`);
    console.log(`   JWT_SECRET configured: ${process.env.JWT_SECRET ? "✅ YES" : "❌ NO"}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Invalid auth header format");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log(`🔐 Token length: ${token.length} chars`);
    
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
    const decodedUserId = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub;
    console.log(`✅ Token decoded. User ID: ${decodedUserId || "missing"}`);

    if (!decodedUserId) {
      console.error("❌ Token decoded but user id claim is missing");
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again.",
      });
    }

    const user = await User.findById(decodedUserId).select("-password");
    
    if (!user) {
      console.error(`❌ User not found in DB for ID: ${decodedUserId}`);
      console.error(`   Check: MONGO_URI points to correct database`);
      console.error(`   Check: JWT_SECRET matches frontend token issuer`);
      return res.status(401).json({
        success: false,
        message: "Session invalid. Please login again.",
      });
    }

    req.user = user;
    console.log(`✅ Authenticated User: ${user._id} (${user.email})`);

    next();
  } catch (error) {
    console.error(`❌ Auth error: ${error.message}`);
    if (error.name === "JsonWebTokenError") {
      console.error(`   JWT is invalid or JWT_SECRET mismatch`);
    }
    if (error.name === "TokenExpiredError") {
      console.error(`   Token has expired`);
    }

    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
