require("dotenv").config();

const mongoose = require("mongoose");
const cloudinary = require("../src/config/cloudinary");
const Product = require("../src/models/Product");
const path = require("path");
const fs = require("fs");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected");

    const products = await Product.find({
      images: { $elemMatch: { $regex: "^/uploads" } },
    });

    console.log(`📦 Found ${products.length} products to migrate`);

    for (const product of products) {
      console.log(`➡️ Migrating product: ${product.name}`);

      const newImages = [];

      for (const img of product.images) {
        try {
          if (!img || typeof img !== "string") {
            console.warn("⚠️ Invalid image value:", img);
            continue;
          }

          const localPath = path.join(__dirname, "..", img);

          if (!fs.existsSync(localPath)) {
            console.warn("⚠️ File not found:", localPath);
            continue;
          }

          console.log("☁️ Uploading:", localPath);

          const upload = await cloudinary.uploader.upload(localPath, {
            folder: "products",
            resource_type: "image",
          });

          newImages.push(upload.secure_url);
          console.log("✅ Uploaded:", upload.secure_url);
        } catch (imgErr) {
          console.error("❌ Image upload failed:", imgErr);
        }
      }

      if (newImages.length > 0) {
        product.images = newImages;
        await product.save();
        console.log("💾 Product updated in DB");
      } else {
        console.warn("⚠️ No images migrated for product:", product.name);
      }
    }

    console.log("🎉 Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("🔥 Migration script failed:", err);
    process.exit(1);
  }
})();
