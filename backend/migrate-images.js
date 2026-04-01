// backend/migrate-images.js
const mongoose = require("mongoose");
const { uploadToCloudinary } = require("./config/cloudinary");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function migrateExistingImages() {
  try {
    console.log("🚀 Starting image migration to Cloudinary...\n");

    // Load environment variables
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      require("dotenv").config({ path: envPath });
    }

    // Check Cloudinary config
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("❌ Cloudinary credentials not found in .env file");
      console.error("   Please add:");
      console.error("   CLOUDINARY_CLOUD_NAME=your_cloud_name");
      console.error("   CLOUDINARY_API_KEY=your_api_key");
      console.error("   CLOUDINARY_API_SECRET=your_api_secret");
      process.exit(1);
    }

    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bakery"
    );
    console.log("✅ Connected to MongoDB\n");

    // Import Product model with correct path
    const Product = require("./src/models/Product");
    const products = await Product.find({});

    console.log(`📦 Found ${products.length} products to process\n`);

    let migratedCount = 0;
    let totalImages = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] ${product.name}`);

      if (!product.images || product.images.length === 0) {
        console.log("   No images\n");
        continue;
      }

      console.log(`   Found ${product.images.length} images`);

      const newImages = [];
      const newPublicIds = [];
      let migratedImages = 0;

      for (let j = 0; j < product.images.length; j++) {
        const image = product.images[j];

        // Skip if already a Cloudinary URL
        if (image && image.includes("cloudinary.com")) {
          console.log(`   Image ${j + 1}: Already Cloudinary ✓`);
          newImages.push(image);

          // Try to extract public_id
          const publicIdMatch = image.match(
            /upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp|gif)/
          );
          if (publicIdMatch && publicIdMatch[1]) {
            newPublicIds.push(publicIdMatch[1]);
          } else {
            newPublicIds.push("");
          }
          continue;
        }

        // Handle local file path
        if (typeof image === "string" && image) {
          let filePath = image;

          // Clean path - remove leading slash if present
          if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
          }

          // Try different possible locations
          let fullPath;

          // Option 1: Relative to backend root
          fullPath = path.join(__dirname, filePath);

          // Option 2: If not found, try from uploads directory
          if (!fs.existsSync(fullPath)) {
            fullPath = path.join(
              __dirname,
              "uploads",
              filePath.replace("uploads/", "")
            );
          }

          // Option 3: If still not found, check if it's just a filename
          if (!fs.existsSync(fullPath) && !image.includes("/")) {
            fullPath = path.join(__dirname, "uploads", "products", image);
          }

          if (fs.existsSync(fullPath)) {
            try {
              console.log(`   Uploading image ${j + 1} to Cloudinary...`);
              const fileBuffer = fs.readFileSync(fullPath);
              const result = await uploadToCloudinary(
                fileBuffer,
                "bakery-products"
              );

              newImages.push(result.url);
              newPublicIds.push(result.public_id);
              migratedImages++;
              totalImages++;

              console.log(`   ✅ Uploaded: ${result.public_id}`);

              // Optional: Delete local file after successful upload
              // fs.unlinkSync(fullPath);
              // console.log(`   🗑️ Deleted local file`);
            } catch (uploadError) {
              console.log(`   ❌ Failed to upload: ${uploadError.message}`);
              // Keep original
              newImages.push(image);
              newPublicIds.push("");
            }
          } else {
            console.log(`   ⚠️ File not found: ${image}`);
            console.log(`     Tried: ${fullPath}`);
            // Keep original
            newImages.push(image);
            newPublicIds.push("");
          }
        } else {
          // Invalid image entry
          console.log(`   ⚠️ Invalid image entry at index ${j}`);
          newImages.push("");
          newPublicIds.push("");
        }
      }

      // Update product if any images were migrated
      if (migratedImages > 0) {
        product.images = newImages;
        product.cloudinaryPublicIds = newPublicIds;
        await product.save();
        migratedCount++;
        console.log(
          `   ✅ Migrated ${migratedImages} images for this product\n`
        );
      } else {
        console.log("   No new images migrated\n");
      }
    }

    console.log("\n🎉 Migration Summary:");
    console.log("===================");
    console.log(`Total products processed: ${products.length}`);
    console.log(`Products migrated: ${migratedCount}`);
    console.log(`Total images migrated to Cloudinary: ${totalImages}`);

    mongoose.disconnect();
    console.log("\n✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration error:", error);
    console.error("\n💡 Troubleshooting:");
    console.error("1. Check MongoDB is running");
    console.error("2. Verify Cloudinary credentials in .env");
    console.error("3. Ensure you have internet connection");
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--dry-run")) {
  console.log("🔍 Dry run mode - No changes will be made");
  // You could modify the script to only show what would be done
}

migrateExistingImages();
