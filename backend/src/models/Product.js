const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      index: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      index: true,
    },
    // Updated: Store Cloudinary URLs directly
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Bakery-specific fields
    weight: {
      type: String,
      default: "500g",
    },
    flavour: {
      type: String,
      default: "Vanilla",
    },
    // New: Store Cloudinary public_id for deletion
    cloudinaryPublicIds: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add text index for search
productSchema.index({
  name: "text",
  description: "text",
  category: "text",
  flavour: "text",
});

// Method to get formatted image URLs (for frontend)
productSchema.methods.getImageUrls = function () {
  if (!this.images || this.images.length === 0) {
    return [];
  }

  return this.images.map((img, index) => {
    // If already a full Cloudinary URL
    if (img.startsWith("http")) {
      return img;
    }
    // If local path, convert to full URL
    if (img.startsWith("/uploads/")) {
      return `http://localhost:5000${img}`;
    }
    // Return as-is
    return img;
  });
};

// Method to check if image is from Cloudinary
productSchema.methods.isCloudinaryImage = function (index = 0) {
  if (!this.images || !this.images[index]) return false;
  return (
    this.images[index].includes("cloudinary.com") ||
    (this.cloudinaryPublicIds && this.cloudinaryPublicIds[index])
  );
};

module.exports = mongoose.model("Product", productSchema);
