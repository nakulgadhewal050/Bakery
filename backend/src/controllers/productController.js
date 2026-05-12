const Product = require("../models/Product");
const { deleteFromCloudinary } = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");
// Helper: Extract Cloudinary public_id from URL
const extractPublicId = (url) => {
  if (!url) return null;

  // Cloudinary URL pattern
  const cloudinaryMatch = url.match(
    /upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp)/
  );
  if (cloudinaryMatch && cloudinaryMatch[1]) {
    return cloudinaryMatch[1];
  }

  return null;
};

// ============= GET ALL PRODUCTS =============
exports.getAllProducts = async (req, res) => {
  try {
    console.log("📦 Fetching all products...");

    const {
      category,
      flavour,
      minPrice,
      maxPrice,
      limit = 100,
      page = 1,
      search,
    } = req.query;

    let filter = {};

    // Build filter
    if (category && category !== "All") {
      filter.category = category;
    }

    if (flavour && flavour !== "All") {
      filter.flavour = flavour;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { flavour: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .select("-cloudinaryPublicIds"); // Don't send public_ids to frontend

    const total = await Product.countDocuments(filter);

    console.log(`✅ Found ${products.length} products`);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: products.map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        category: product.category || "Classic Cakes",
        description: product.description || "Delicious bakery item",
        stock: product.stock || 0,
        flavour: product.flavour || "Vanilla",
        weight: product.weight || "500g",
        images: product.getImageUrls(),
        rating: product.rating || 0,
        reviewsCount: product.reviewsCount || 0,
        isFeatured: product.isFeatured || false,
        tags: product.tags || [],
        createdAt: product.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= GET SINGLE PRODUCT =============
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select(
      "-cloudinaryPublicIds"
    ); // Don't send public_ids to frontend

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ============= CREATE PRODUCT =============


exports.createProduct = async (req, res) => {
  try {
    let images = [];
    let cloudinaryPublicIds = [];

    // 🌩️ Cloudinary (PRIMARY)
    if (req.cloudinaryFiles?.length) {
      images = req.cloudinaryFiles;
      cloudinaryPublicIds = req.cloudinaryPublicIds || [];
    }

    // 🧪 Local fallback (DEV ONLY)
    else if (
      process.env.NODE_ENV !== "production" &&
      req.localFiles?.length
    ) {
      images = req.localFiles;
    }

    const product = await Product.create({
      ...req.body,
      images,
      cloudinaryPublicIds,
    });

res.status(201).json({
  success: true,
  product: {
    ...product.toObject(),
    images: product.getImageUrls(), // ✅ FIX
  },
});

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Product creation failed",
    });
  }
};




// ============= UPDATE PRODUCT =============
// ============= UPDATE PRODUCT =============
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.cloudinaryFiles?.length > 0) {
      updateData.images = req.cloudinaryFiles;
      updateData.cloudinaryPublicIds = req.cloudinaryPublicIds;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};


// ============= DELETE PRODUCT =============
exports.deleteProduct = async (req, res) => {
  try {
    console.log("🗑️ Deleting product:", req.params.id);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete Cloudinary images
    if (product.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
      console.log(
        `🗑️ Deleting ${product.cloudinaryPublicIds.length} images from Cloudinary...`
      );

      for (const publicId of product.cloudinaryPublicIds) {
        try {
          await deleteFromCloudinary(publicId);
          console.log(`✅ Deleted Cloudinary image: ${publicId}`);
        } catch (cloudinaryError) {
          console.error(
            `❌ Error deleting Cloudinary image: ${cloudinaryError.message}`
          );
        }
      }
    }

    // Delete local files
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.startsWith("/uploads/")) {
          const filePath = path.join(__dirname, "..", "..", image);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`🗑️ Deleted local file: ${filePath}`);
            } catch (fileError) {
              console.error(
                `❌ Error deleting local file: ${fileError.message}`
              );
            }
          }
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// ============= GET FEATURED PRODUCTS =============
exports.getFeaturedProducts = async (req, res) => {
  try {
    console.log("⭐ Fetching featured products...");

    const products = await Product.find({ isFeatured: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products: products.map((product) => ({
        ...product.toObject(),
        images: product.getImageUrls(), // ✅ THIS FIXES IMAGE ISSUE
      })),
    });
  } catch (error) {
    console.error("❌ Featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};

// GET UNIQUE WEIGHTS FOR FILTER
exports.getUniqueWeights = async (req, res) => {
  try {
    const weights = await Product.distinct("weight");

    res.json({
      success: true,
      weights: weights.filter(Boolean), // null/empty hatao
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weights",
    });
  }
};
