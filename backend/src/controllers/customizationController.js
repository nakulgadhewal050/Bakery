const Customization = require("../models/Customization");
const CustomCakeOrder = require("../models/CustomCakeOrder");

const customizationController = {
  getAllCustomizations: async (req, res) => {
    try {
      const customizations = await Customization.find({ available: true }).sort(
        {
          sortOrder: 1,
          category: 1,
        }
      );

      res.json({ success: true, data: customizations });
    } catch (error) {
      console.error("Get all customizations error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getCustomizationsByCategory: async (req, res) => {
    try {
      const category = req.params.category;

      // Capitalize first letter and handle different category names
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

      // Handle category name variations
      const categoryMap = {
        Flavors: "Flavor",
        Fillings: "Filling",
        Icings: "Icing",
        Toppings: "Toppings",
        Decorations: "Decoration",
        Themes: "Theme",
      };

      const mappedCategory = categoryMap[categoryName] || categoryName;

      console.log(`Fetching customizations for category: ${mappedCategory}`);

      const customizations = await Customization.find({
        category: mappedCategory,
        available: true,
      }).sort({ sortOrder: 1 });

      console.log(
        `Found ${customizations.length} customizations for ${mappedCategory}`
      );

      res.json({ success: true, data: customizations });
    } catch (error) {
      console.error(
        `Get customizations for ${req.params.category} error:`,
        error
      );
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getBaseCakes: async (req, res) => {
    try {
      const baseCakes = [
        {
          id: "classic-round",
          name: "Classic Round Cake",
          basePrice: 599,
          image: "/images/cakes/round-cake.jpg",
          description: "Classic round shaped cake perfect for any occasion",
        },
        {
          id: "square-cake",
          name: "Square Cake",
          basePrice: 699,
          image: "/images/cakes/square-cake.jpg",
          description: "Modern square shaped cake",
        },
        {
          id: "heart-shaped",
          name: "Heart Shaped Cake",
          basePrice: 799,
          image: "/images/cakes/heart-shaped.jpg",
          description: "Romantic heart shaped cake",
        },
        {
          id: "tiered-cake",
          name: "Tiered Cake",
          basePrice: 1499,
          image: "/images/cakes/tiered-cake.jpg",
          description: "Elegant tiered wedding cake",
        },
        {
          id: "cupcake-set",
          name: "Cupcake Set (6 pcs)",
          basePrice: 499,
          image: "/images/cakes/cupcake-set.jpg",
          description: "Set of 6 beautifully decorated cupcakes",
        },
        {
          id: "mini-cake",
          name: "Mini Cake",
          basePrice: 349,
          image: "/images/cakes/mini-cake.jpg",
          description: "Single serve mini cake",
        },
      ];

      res.json({ success: true, data: baseCakes });
    } catch (error) {
      console.error("Get base cakes error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  calculateCustomCakePrice: async (req, res) => {
    try {
      const { basePrice, customizations } = req.body;
      console.log("Calculating price:", { basePrice, customizations });

      let total = basePrice || 0;

      // Handle different customization types
      if (customizations) {
        // Single selections (flavor, filling, icing, theme)
        if (customizations.flavor?.price) total += customizations.flavor.price;
        if (customizations.filling?.price)
          total += customizations.filling.price;
        if (customizations.icing?.price) total += customizations.icing.price;
        if (customizations.theme?.price) total += customizations.theme.price;

        // Array selections (toppings, decorations)
        if (customizations.toppings && Array.isArray(customizations.toppings)) {
          customizations.toppings.forEach((topping) => {
            if (topping.price) total += topping.price;
          });
        }

        if (
          customizations.decorations &&
          Array.isArray(customizations.decorations)
        ) {
          customizations.decorations.forEach((decoration) => {
            if (decoration.price) total += decoration.price;
          });
        }
      }

      console.log("Calculated total:", total);

      res.json({
        success: true,
        data: { basePrice: basePrice || 0, totalPrice: total },
      });
    } catch (error) {
      console.error("Price calculation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  createCustomCakeOrder: async (req, res) => {
    try {
      console.log("Creating custom cake order:", req.body);

      const orderData = {
        user: req.user.id,
        ...req.body,
        status: "pending",
        paymentStatus: "pending",
      };

      const order = await CustomCakeOrder.create(orderData);

      console.log("Order created:", order.orderNumber);

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: error.message,
      });
    }
  },

  uploadCustomerDesign: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      const filename = req.file.filename;
      const imageURL = `http://localhost:5000/uploads/designs/${filename}`;

      const order = await CustomCakeOrder.findById(req.params.orderId);
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });

      order.customerDesignImage = {
        url: imageURL,
        description: "Customer uploaded design",
      };
      await order.save();

      res.json({
        success: true,
        message: "Design uploaded",
        data: order.customerDesignImage,
      });
    } catch (error) {
      console.error("Upload design error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload design",
        error: error.message,
      });
    }
  },

  getUserCustomCakeOrders: async (req, res) => {
    try {
      const orders = await CustomCakeOrder.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate("user", "name email");

      res.json({ success: true, data: orders });
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  },

  getCustomCakeOrderById: async (req, res) => {
    try {
      const order = await CustomCakeOrder.findById(req.params.orderId).populate(
        "user",
        "name email phone"
      );

      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });

      res.json({ success: true, data: order });
    } catch (error) {
      console.error("Get order by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      });
    }
  },
};

module.exports = customizationController;
