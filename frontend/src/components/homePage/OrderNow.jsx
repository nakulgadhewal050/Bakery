/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCart, clearCart } from "../redux/Slice";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const OrderNow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, taxRate, delivery } = useSelector(selectCart);
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", postalCode: "",
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax + delivery;

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("userToken") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token");

    if (!token) {
      toast.error("Please login to place an order");
      setTimeout(() => navigate("/login", { state: { from: "/order" } }), 1000);
      return;
    }

    setUserToken(token);
    setIsCheckingAuth(false);

    const user = getStoredUser();
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        name: user.name || user.fullName || user.username || "",
        phone: user.phone || user.mobile || "",
      }));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    // Validate address
    const requiredFields = ["name", "phone", "addressLine1", "city", "state", "postalCode"];
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }
    if (shippingAddress.phone.length !== 10 || !/^\d+$/.test(shippingAddress.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
        img: item.image || item.img || "",
      }));

      // Create order + Stripe Checkout Session
      const { data } = await api.post("/api/orders/create-simple", {
        items: orderItems,
        shippingAddress,
        paymentMethod: "stripe",
      });

      if (!data?.success) {
        throw new Error(data?.message || "Order creation failed");
      }

      console.log("📦 Order created:", data.order._id);
      console.log("🔗 Stripe session URL:", data.sessionUrl);

      // Save orderId in localStorage for success page
      localStorage.setItem("pendingOrderId", data.order._id);
      localStorage.setItem("pendingSessionId", data.sessionId);

      // Redirect to Stripe Checkout (popup-like hosted page)
      window.location.href = data.sessionUrl;

    } catch (err) {
      console.error("❌ Payment error:", err);
      const msg = err?.response?.data?.message || err.message || "Payment failed";
      toast.error(msg);
      setLoading(false);
    }
  };

  // ── Loading / Auth / Empty states ──
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
          <button onClick={() => navigate("/menu")} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!userToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Please Login First</h2>
          <button onClick={() => navigate("/login", { state: { from: "/order" } })} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 pt-28 px-4 md:px-8 pb-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-rose-700 mb-8">Complete Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

          {/* ── Left: Shipping Address ── */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name *"
                  value={shippingAddress.name} onChange={handleInputChange}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />

                <input type="tel" name="phone" placeholder="Phone Number *"
                  value={shippingAddress.phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 10) setShippingAddress((p) => ({ ...p, phone: v }));
                  }}
                  maxLength={10} inputMode="numeric"
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />

                <input type="text" name="addressLine1" placeholder="Address Line 1 *"
                  value={shippingAddress.addressLine1} onChange={handleInputChange}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />

                <input type="text" name="addressLine2" placeholder="Address Line 2 (Optional)"
                  value={shippingAddress.addressLine2} onChange={handleInputChange}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />

                <input type="text" name="city" placeholder="City *"
                  value={shippingAddress.city} onChange={handleInputChange}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />

                <input type="text" name="state" placeholder="State *"
                  value={shippingAddress.state} onChange={handleInputChange}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />

                <input type="text" name="postalCode" placeholder="Postal Code *"
                  value={shippingAddress.postalCode} onChange={handleInputChange}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <p className="text-sm text-gray-500 mt-3">* Required fields</p>
            </div>
          </div>

          {/* ── Right: Summary + Pay Button ── */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>₹{delivery}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-red-600 text-xl font-bold">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* PAY BUTTON */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Opening Payment...
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    {`Pay ₹${grandTotal.toFixed(2)}`}
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4 text-center">
                🔒 Secure payment powered by Stripe
              </p>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Logged in as: <span className="font-medium">{getStoredUser().name || "User"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100 mt-8">
          <h2 className="text-xl font-semibold mb-4">Order Items ({items.length})</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                <img
                  src={item.image || item.img || "/Image/default.avif"}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/Image/default.avif"; }}
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-gray-600">Qty: {item.qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(item.price * item.qty).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderNow;