const express = require("express");
const router = express.Router();

const customizationController = require("../controllers/customizationController");
const protect = require("../middlewares/authMiddleware");
const designUpload = require("../middlewares/designUploadMiddleware");

// Public Routes
router.get("/customizations", customizationController.getAllCustomizations);
router.get("/customizations/:category", customizationController.getCustomizationsByCategory);
router.get("/customizations/base-cakes", customizationController.getBaseCakes);
router.post(
  "/customizations/custom-cake/calculate-price",
  customizationController.calculateCustomCakePrice
);

// Protected User Routes
router.post(
  "/customizations/custom-cake/order",
  protect,
  customizationController.createCustomCakeOrder
);
router.get(
  "/customizations/custom-cake/orders",
  protect,
  customizationController.getUserCustomCakeOrders
);
router.get(
  "/customizations/custom-cake/orders/:orderId",
  protect,
  customizationController.getCustomCakeOrderById
);

router.post(
  "/customizations/custom-cake/upload-design/:orderId",
  protect,
  designUpload.single("designImage"),
  customizationController.uploadCustomerDesign
);

module.exports = router;
