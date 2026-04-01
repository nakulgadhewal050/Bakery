const Order = require("../models/Order");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const https = require("https");

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpaySecret = (process.env.RAZORPAY_SECRET || "").trim();
const isRazorpayConfigured = Boolean(razorpayKeyId && razorpaySecret);
const transientRazorpayNetworkErrorCodes = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNRESET",
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "ECONNREFUSED",
  "EHOSTUNREACH",
  "ENETUNREACH",
]);

// Razorpay instance
const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpaySecret,
});

const createRazorpayOrderViaHttp = (payload) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: "api.razorpay.com",
        port: 443,
        path: "/v1/orders",
        method: "POST",
        auth: `${razorpayKeyId}:${razorpaySecret}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseData = "";

        response.on("data", (chunk) => {
          responseData += chunk;
        });

        response.on("end", () => {
          let parsedResponse = {};

          try {
            parsedResponse = responseData ? JSON.parse(responseData) : {};
          } catch (parseError) {
            return reject(
              new Error(
                `Razorpay response parse failed with status ${response.statusCode}`
              )
            );
          }

          if (response.statusCode >= 200 && response.statusCode < 300) {
            return resolve(parsedResponse);
          }

          const error = new Error(
            parsedResponse?.error?.description || "Razorpay order creation failed"
          );
          error.statusCode = response.statusCode;
          error.raw = parsedResponse;
          return reject(error);
        });
      }
    );

    req.setTimeout(10000, () => {
      req.destroy(Object.assign(new Error("Razorpay request timeout"), { code: "ETIMEDOUT" }));
    });

    req.on("error", (requestError) => {
      reject(requestError);
    });

    req.write(body);
    req.end();
  });
};

const createRazorpayOrderSafely = async (payload) => {
  try {
    return await razorpay.orders.create(payload);
  } catch (sdkError) {
    const hasHttpStatus =
      sdkError?.statusCode || sdkError?.status || sdkError?.error?.statusCode;

    if (hasHttpStatus) {
      throw sdkError;
    }

    console.warn(
      "⚠️ Razorpay SDK create() failed without HTTP response, retrying with direct API call"
    );
    return createRazorpayOrderViaHttp(payload);
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientRazorpayNetworkError = (error) => {
  const code = error?.code || error?.cause?.code || error?.error?.code;
  return transientRazorpayNetworkErrorCodes.has(code);
};

const createRazorpayOrderWithRetry = async (payload, maxAttempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await createRazorpayOrderSafely(payload);
    } catch (error) {
      lastError = error;
      const shouldRetry =
        attempt < maxAttempts && isTransientRazorpayNetworkError(error);

      if (!shouldRetry) {
        throw error;
      }

      const backoffMs = 300 * attempt;
      console.warn(
        `⚠️ Razorpay network error (${error.code || "unknown"}) on attempt ${attempt}/${maxAttempts}. Retrying in ${backoffMs}ms...`
      );
      await wait(backoffMs);
    }
  }

  throw lastError;
};

const getRazorpayOrderErrorResponse = (razorpayError) => {
  const razorpayStatusCode =
    razorpayError?.statusCode ||
    razorpayError?.status ||
    razorpayError?.error?.statusCode;

  if (razorpayStatusCode === 401) {
    return {
      status: 500,
      message:
        "Razorpay authentication failed. Verify RAZORPAY_KEY_ID and RAZORPAY_SECRET, then restart server.",
    };
  }

  if (isTransientRazorpayNetworkError(razorpayError)) {
    return {
      status: 503,
      message:
        "Unable to reach Razorpay at the moment. Please check server internet/DNS and retry.",
    };
  }

  return {
    status: 500,
    message: "Failed to create payment order. Please try again.",
  };
};

/* =====================================================
   CREATE ORDER (USER) - Handles both static & DB products
===================================================== */
exports.createOrder = async (req, res) => {
  try {
    console.log("🔍 CREATE ORDER REQUEST:");
    console.log("User:", req.user);
    console.log("User ID:", req.user?._id);

    const { items, shippingAddress, paymentMethod } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error("❌ No user found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user._id;
    console.log("📝 Processing order for user ID:", userId);

    if (!items || !items.length) {
      console.error("❌ No items in cart");
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate required shipping fields
    if (!shippingAddress) {
      console.error("❌ No shipping address");
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        console.error(`❌ Missing field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Please fill in ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`,
        });
      }
    }

    // Validate phone number
    if (
      shippingAddress.phone.length !== 10 ||
      !/^\d+$/.test(shippingAddress.phone)
    ) {
      console.error("❌ Invalid phone number:", shippingAddress.phone);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Validate each item and calculate total
    for (const item of items) {
      console.log(`🔍 Processing item:`, item);

      // Check if item has a product ID (from database) or is static data
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        // This is a database product - validate it exists
        const product = await Product.findById(item.product);

        if (!product) {
          console.error(`❌ Database product not found: ${item.product}`);
          return res.status(404).json({
            success: false,
            message: `Product "${item.name}" not found in database`,
          });
        }

        console.log(
          `📦 Found database product: ${product.name}, Stock: ${product.stock}, Requested: ${item.qty}`
        );

        if (product.stock < item.qty) {
          console.error(`❌ Insufficient stock for ${product.name}`);
          return res.status(400).json({
            success: false,
            message: `"${product.name}" is out of stock. Only ${product.stock} available`,
          });
        }

        if (item.qty < 1) {
          console.error(`❌ Invalid quantity for ${product.name}: ${item.qty}`);
          return res.status(400).json({
            success: false,
            message: `Quantity for "${product.name}" must be at least 1`,
          });
        }

        totalAmount += product.price * item.qty;

        validatedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          qty: item.qty,
          img: item.img || product.images?.[0] || "",
        });
      } else {
        // This is static/Redux data - just use the provided values
        console.log(`📦 Processing static product: ${item.name}`);

        if (!item.name || !item.price || !item.qty) {
          console.error(`❌ Invalid static product data:`, item);
          return res.status(400).json({
            success: false,
            message: `Invalid product data for "${item.name || "unknown"}"`,
          });
        }

        if (item.qty < 1) {
          console.error(`❌ Invalid quantity for ${item.name}: ${item.qty}`);
          return res.status(400).json({
            success: false,
            message: `Quantity for "${item.name}" must be at least 1`,
          });
        }

        totalAmount += item.price * item.qty;

        validatedItems.push({
          name: item.name,
          price: item.price,
          qty: item.qty,
          img: item.img || item.image || "",
        });
      }
    }

    console.log(`💰 Total amount calculated: ${totalAmount}`);

    // Add tax (10%) and delivery charge (assuming 40)
    const tax = totalAmount * 0.1;
    const deliveryCharge = 40;
    const grandTotal = totalAmount + tax + deliveryCharge;

    console.log(
      `📊 Order summary: Subtotal=${totalAmount}, Tax=${tax}, Delivery=${deliveryCharge}, Total=${grandTotal}`
    );

    // Create Razorpay order if payment method is razorpay
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
      if (!isRazorpayConfigured) {
        console.error("❌ Razorpay credentials are missing in environment");
        return res.status(500).json({
          success: false,
          message:
            "Razorpay is not configured on server. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET.",
        });
      }

      try {
        const amountInPaise = Math.round(grandTotal * 100);
        console.log(
          `💳 Creating Razorpay order for amount: ${amountInPaise} paise`
        );
        if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid order amount",
          });
        }

        razorpayOrder = await createRazorpayOrderWithRetry({
          amount: amountInPaise, // Convert to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}_${userId.toString().slice(-6)}`,
          payment_capture: 1, // Auto capture payment
        });
        console.log(`✅ Razorpay order created: ${razorpayOrder.id}`);
      } catch (razorpayError) {
        console.error("❌ Razorpay order creation error:", razorpayError);
        const { status, message } = getRazorpayOrderErrorResponse(razorpayError);
        return res.status(status).json({
          success: false,
          message,
        });
      }
    }

    // Create order in database
    console.log(`💾 Creating order in database for user: ${userId}`);
    const order = await Order.create({
      user: userId,
      items: validatedItems,
      shippingAddress,
      totalAmount: grandTotal,
      subtotal: totalAmount,
      tax: tax,
      deliveryCharge: deliveryCharge,
      paymentMethod: paymentMethod || "razorpay",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      razorpay: razorpayOrder
        ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : {},
      orderStatus: "created",
    });

    console.log(`✅ Order created successfully: ${order._id}`);

    res.status(201).json({
      success: true,
      keyId: razorpayKeyId || undefined,
      order,
      razorpayOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/* =====================================================
   CREATE SIMPLE ORDER - For static data only
===================================================== */
exports.createSimpleOrder = async (req, res) => {
  try {
    console.log("📦 CREATE SIMPLE ORDER REQUEST");
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!req.user || !req.user._id) {
      console.error("❌ No user found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user._id;
    console.log("👤 User ID:", userId);

    if (!items || !items.length) {
      console.error("❌ No items in cart");
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        console.error(`❌ Missing field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Please fill in ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`,
        });
      }
    }

    if (
      shippingAddress.phone.length !== 10 ||
      !/^\d+$/.test(shippingAddress.phone)
    ) {
      console.error("❌ Invalid phone number:", shippingAddress.phone);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    let totalAmount = 0;

    const validatedItems = items.map((item) => {
      const itemTotal = item.price * item.qty;
      totalAmount += itemTotal;
      console.log(`📊 Item: ${item.name} x ${item.qty} = ₹${itemTotal}`);
      return {
        name: item.name,
        price: item.price,
        qty: item.qty,
        img: item.img || item.image || "",
      };
    });

    const tax = totalAmount * 0.1;
    const deliveryCharge = 40;
    const grandTotal = totalAmount + tax + deliveryCharge;

    console.log(
      `💰 Order total: Subtotal=₹${totalAmount}, Tax=₹${tax}, Delivery=₹${deliveryCharge}, Total=₹${grandTotal}`
    );

    let razorpayOrder = null;

    if (paymentMethod === "razorpay") {
      if (!isRazorpayConfigured) {
        console.error("❌ Razorpay credentials are missing in environment");
        return res.status(500).json({
          success: false,
          message:
            "Razorpay is not configured on server. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET.",
        });
      }

      try {
        const amountInPaise = Math.round(grandTotal * 100);
        console.log(
          `💳 Creating Razorpay order for amount: ₹${grandTotal} (${amountInPaise} paise)`
        );
        if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid order amount",
          });
        }

        razorpayOrder = await createRazorpayOrderWithRetry({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${Date.now()}_${userId.toString().slice(-6)}`,
          payment_capture: 1,
        });
        console.log(`✅ Razorpay order created: ${razorpayOrder.id}`);
      } catch (razorpayError) {
        console.error("❌ Razorpay order creation error:", razorpayError);
        const { status, message } = getRazorpayOrderErrorResponse(razorpayError);
        return res.status(status).json({
          success: false,
          message,
        });
      }
    }

    const order = await Order.create({
      user: userId,
      items: validatedItems,
      shippingAddress,
      totalAmount: grandTotal,
      subtotal: totalAmount,
      tax,
      deliveryCharge,
      paymentMethod: paymentMethod || "razorpay",
      paymentStatus: "pending",
      razorpay: razorpayOrder
        ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : {},
      orderStatus: "created",
    });

    console.log(`✅ Order created in DB: ${order._id}`);

    res.status(201).json({
      success: true,
      keyId: razorpayKeyId || undefined,
      order,
      razorpayOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Create simple order error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/* =====================================================
   VERIFY PAYMENT & UPDATE STOCK
===================================================== */
exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔍 VERIFY PAYMENT REQUEST:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      console.error("❌ Missing payment details");
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Generate signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(body)
      .digest("hex");

    console.log(`🔐 Signature verification:
      Expected: ${expectedSignature.substring(0, 20)}...
      Received: ${razorpay_signature.substring(0, 20)}...
      Match: ${expectedSignature === razorpay_signature}`);

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find and update order
    const order = await Order.findById(orderId);
    console.log(`🔍 Found order: ${order ? order._id : "Not found"}`);

    if (!order) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order with payment details
    order.paymentStatus = "paid";
    order.razorpay.paymentId = razorpay_payment_id;
    order.razorpay.signature = razorpay_signature;
    order.orderStatus = "confirmed";
    order.paidAt = new Date();

    await order.save();
    console.log(`✅ Payment verified and order updated: ${order._id}`);

    res.json({
      success: true,
      order,
      message: "Payment verified and order confirmed successfully",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/* =====================================================
   USER ORDERS
===================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`📦 Fetching orders for user: ${userId}`);

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("❌ Get my orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* =====================================================
   GET SINGLE ORDER DETAILS
===================================================== */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`🔍 Fetching order ${id} for user ${userId}`);
    const order = await Order.findOne({
      _id: id,
      user: userId,
    });

    if (!order) {
      console.error(`❌ Order not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log(`✅ Order found: ${order._id}`);
    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN → ALL ORDERS
===================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    console.log("👑 Admin fetching all orders");
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} total orders`);
    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE ORDER STATUS (ADMIN)
===================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating order ${id} to status: ${status}`);

    if (!status) {
      console.error("❌ Status is required");
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "created",
      "confirmed",
      "preparing",
      "out-for-delivery",
      "delivered",
      "cancelled",
      "returned",
    ];

    if (!validStatuses.includes(status)) {
      console.error(`❌ Invalid status: ${status}`);
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      console.error(`❌ Order not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update status and timestamps
    order.orderStatus = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    } else if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();
    console.log(`✅ Order ${id} updated to ${status}`);

    res.json({
      success: true,
      order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

/* =====================================================
   CANCEL ORDER (USER)
===================================================== */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`❌ User ${userId} attempting to cancel order ${id}`);
    const order = await Order.findOne({
      _id: id,
      user: userId,
    });

    if (!order) {
      console.error(`❌ Order not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ["delivered", "out-for-delivery"];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      console.error(`❌ Cannot cancel order with status: ${order.orderStatus}`);
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    if (order.orderStatus === "cancelled") {
      console.error(`❌ Order already cancelled: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Update order status
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();

    await order.save();
    console.log(`✅ Order ${id} cancelled successfully`);

    res.json({
      success: true,
      order,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ORDER STATISTICS (ADMIN)
===================================================== */
exports.getOrderStats = async (req, res) => {
  try {
    console.log("📊 Getting order statistics");

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["created", "confirmed", "preparing"] },
    });

    console.log(
      `📊 Stats: Total=${totalOrders}, Revenue=${
        totalRevenue[0]?.total || 0
      }, Today=${todayOrders}, Pending=${pendingOrders}`
    );

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("❌ Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};
