const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  uploadMemory,
  handleCloudinaryUpload,
} = require("../middlewares/uploadMiddleware");

const productController = require("../controllers/productController");

/* PUBLIC */
router.get("/product", productController.getAllProducts);
router.get("/product/single/:id", productController.getProduct);

/* FEATURED (BOTH PATHS SUPPORTED) */
router.get("/featured", productController.getFeaturedProducts);
router.get("/product/featured", productController.getFeaturedProducts);

/* ADMIN */
router.post(
  "/product/create",
  adminMiddleware,
  uploadMemory.array("images", 5),
  handleCloudinaryUpload,
  productController.createProduct
);

router.put(
  "/product/update/:id",
  adminMiddleware,
  uploadMemory.array("images", 5),
  handleCloudinaryUpload,
  productController.updateProduct
);

router.delete(
  "/product/delete/:id",
  adminMiddleware,
  productController.deleteProduct
);

router.get("/product/options", (req, res) => {
  res.json({
    success: true,
    categories: [
      "Cakes",
      "Desserts",
      "Pastries",
      "Custom Cakes",
      "Cupcakes",
    ],
    flavours: [
      "Vanilla",
      "Chocolate",
      "Strawberry",
      "Mango",
      "Butterscotch",
    ],
    weights: ["500g", "1kg", "2kg"],
  });
});

module.exports = router;
