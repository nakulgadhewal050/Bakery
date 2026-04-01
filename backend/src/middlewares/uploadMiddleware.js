const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadToCloudinary } = require("../config/cloudinary");

// Ensure uploads directory exists (for fallback)
const uploadDir = path.join(__dirname, "..", "..", "uploads", "products");
console.log("UPLOAD DIRECTORY:", uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Option 1: Memory storage for Cloudinary
const memoryStorage = multer.memoryStorage();

// Option 2: Disk storage for local
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};

// Create multer instances
const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Cloudinary upload handler middleware
const handleCloudinaryUpload = async (req, res, next) => {
  try {
    // Skip if no files
    if (!req.files || req.files.length === 0) {
      return next();
    }

    console.log(`📤 Uploading ${req.files.length} images to Cloudinary...`);

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, "bakery-products")
    );

    const results = await Promise.all(uploadPromises);

    // Store results in request
    req.cloudinaryFiles = results.map((result) => result.url);
    req.cloudinaryPublicIds = results.map((result) => result.public_id);

    console.log(`✅ Uploaded ${results.length} images to Cloudinary`);
    next();
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);

    // Fallback to local storage
    if (req.files && req.files.length > 0) {
      console.log("⚠️ Falling back to local storage...");

      // Save files to disk
      req.files.forEach((file) => {
        const filename =
          Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        const filepath = path.join(uploadDir, filename);

        // Save file to disk
        fs.writeFileSync(filepath, file.buffer);

        // Add path to request
        if (!req.localFiles) req.localFiles = [];
        req.localFiles.push(`/uploads/products/${filename}`);
      });
    }

    next();
  }
};

// For backward compatibility, export the disk storage version
const uploadProductImages = uploadDisk;

module.exports = {
  // For Cloudinary uploads
  uploadMemory,
  handleCloudinaryUpload,

  // For local storage (backward compatibility)
  uploadDisk,
  uploadProductImages,

  // Legacy export for adminRoutes
  multer: uploadDisk,
};
