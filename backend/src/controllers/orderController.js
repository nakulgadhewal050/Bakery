const Order = require("../models/Order");
const Product = require("../models/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const generateInvoice = require("../utils/generateInvoice");

/* =====================================================
   CREATE STRIPE CHECKOUT SESSION (Popup/Redirect)
===================================================== */
exports.createSimpleOrder = async (req, res) => {
  try {
    console.log("📦 CREATE CHECKOUT SESSION");
    const { items, shippingAddress } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate shipping fields
    const requiredFields = ["name", "phone", "addressLine1", "city", "state", "postalCode"];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        });
      }
    }

    if (shippingAddress.phone.length !== 10 || !/^\d+$/.test(shippingAddress.phone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid 10-digit phone number" });
    }

    // Calculate totals
    let totalAmount = 0;
    const validatedItems = items.map((item) => {
      totalAmount += item.price * item.qty;
      return { name: item.name, price: item.price, qty: item.qty, img: item.img || item.image || "" };
    });

    const tax = totalAmount * 0.1;
    const deliveryCharge = 40;
    const grandTotal = totalAmount + tax + deliveryCharge;

    // Save order in DB first (pending)
    const order = await Order.create({
      user: userId,
      items: validatedItems,
      shippingAddress,
      totalAmount: grandTotal,
      subtotal: totalAmount,
      tax,
      deliveryCharge,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "created",
    });

    console.log(`✅ Order saved in DB: ${order._id}`);

    // Build Stripe line_items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: item.img ? [item.img] : [],
        },
        unit_amount: Math.round(item.price * 100), // paise
      },
      quantity: item.qty,
    }));

    // Add tax as line item
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Tax (10%)" },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    // Add delivery charge
    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charge" },
        unit_amount: Math.round(deliveryCharge * 100),
      },
      quantity: 1,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: req.user.email || undefined,
      success_url: `${frontendUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&db_order_id=${order._id}`,
      cancel_url: `${frontendUrl}/order?cancelled=true`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    console.log(`✅ Stripe Checkout Session: ${session.id}`);

    // Save session ID in order
    order.stripe = {
      sessionId: session.id,
      amount: Math.round(grandTotal * 100),
      currency: "inr",
    };
    await order.save();

    res.status(201).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      order,
      message: "Checkout session created",
    });
  } catch (error) {
    console.error("❌ Create checkout session error:", error);
    res.status(500).json({ success: false, message: "Failed to create checkout session", error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  return exports.createSimpleOrder(req, res);
};

/* =====================================================
   VERIFY PAYMENT (called after Stripe redirect)
===================================================== */
exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔍 VERIFY PAYMENT:", req.body);
    const { sessionId, orderId } = req.body;

    if (!sessionId && !orderId) {
      return res.status(400).json({ success: false, message: "Missing sessionId or orderId" });
    }

    let order = null;

    // Find order
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }
    if (!order && sessionId) {
      order = await Order.findOne({ "stripe.sessionId": sessionId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify with Stripe
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log(`💳 Stripe session status: ${session.payment_status}`);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ success: false, message: `Payment not completed. Status: ${session.payment_status}` });
      }

      order.stripe = {
        ...order.stripe,
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
      };
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paidAt = new Date();
    await order.save();

    console.log(`✅ Order confirmed: ${order._id}`);
    res.json({ success: true, order, message: "Payment verified and order confirmed!" });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed", error: error.message });
  }
};

/* =====================================================
   USER ORDERS
===================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order", error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email phone").sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["created", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.orderStatus = status;
    if (status === "delivered") order.deliveredAt = new Date();
    if (status === "cancelled") order.cancelledAt = new Date();
    await order.save();
    res.json({ success: true, order, message: `Order updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update", error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (["delivered", "out-for-delivery", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel: ${order.orderStatus}` });
    }
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    await order.save();
    res.json({ success: true, order, message: "Order cancelled" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel", error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ["created", "confirmed", "preparing"] } });
    res.json({ success: true, stats: { totalOrders, totalRevenue: totalRevenue[0]?.total || 0, todayOrders, pendingOrders } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats", error: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate("user");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const pdfBuffer = await generateInvoice(order, order.user);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Invoice_${order._id.toString().substring(0, 12)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate invoice", error: error.message });
  }
};