import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  increaseQty,
  decreaseQty,
  deleteItem,
  clearCart,
  selectCart,
} from "../redux/Slice";
import { toast } from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, taxRate, delivery } = useSelector(selectCart);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax + delivery;

  const handleProceedToOrder = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/order");
  };

  // Function to check if item is a custom cake
  const isCustomCake = (item) => {
    return (
      item.type === "custom-cake" ||
      item.name?.toLowerCase().includes("custom") ||
      (item.details && Object.keys(item.details).length > 0)
    );
  };

  // Function to render custom cake details
  const renderCustomCakeDetails = (item) => {
    if (!item.details) return null;

    return (
      <div className="mt-2 p-3 bg-pink-50 rounded-lg border border-pink-100 w-full">
        <p className="text-sm font-semibold text-[#e11d48] mb-1 flex items-center gap-1">
          <span>🎂</span> Custom Cake Details:
        </p>
        <div className="text-xs text-[#555555] space-y-1">
          {item.details.baseCake && (
            <p>
              <span className="font-medium text-[#333333]">Base:</span> {item.details.baseCake}
            </p>
          )}
          {item.details.shape && (
            <p>
              <span className="font-medium text-[#333333]">Shape:</span> {item.details.shape}
            </p>
          )}
          {item.details.size && (
            <p>
              <span className="font-medium text-[#333333]">Size:</span> {item.details.size}
            </p>
          )}
          {item.details.flavor && (
            <p>
              <span className="font-medium text-[#333333]">Flavor:</span> {item.details.flavor}
            </p>
          )}
          {item.details.frosting && (
            <p>
              <span className="font-medium text-[#333333]">Frosting:</span>{" "}
              {item.details.frosting}
            </p>
          )}
          {item.details.toppings && item.details.toppings !== "None" && (
            <p>
              <span className="font-medium text-[#333333]">Toppings:</span>{" "}
              {item.details.toppings}
            </p>
          )}
          {item.details.message &&
            item.details.message !== "No custom message" && (
              <p>
                <span className="font-medium text-[#333333]">Message:</span> "
                {item.details.message}"
              </p>
            )}
        </div>
      </div>
    );
  };

  // Function to render custom cake badge
  const renderCustomCakeBadge = () => {
    return (
      <div className="px-2 py-1 bg-[#e11d48] text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
        <span className="text-xs">🎂</span>
        <span className="text-xs">Custom</span>
      </div>
    );
  };

  // Function to render the custom cake visual display
  const renderCustomCakeDisplay = (item) => {
    const cakeShape = item.details?.shape || "Round";
    const cakeFlavor = item.details?.flavor || "Chocolate";

    const flavorColors = {
      chocolate: "bg-gradient-to-r from-amber-900 to-amber-800",
      vanilla: "bg-gradient-to-r from-amber-50 to-yellow-50",
      strawberry: "bg-gradient-to-r from-pink-200 to-rose-300",
      "red velvet": "bg-gradient-to-r from-rose-700 to-rose-800",
      butterscotch: "bg-gradient-to-r from-amber-400 to-orange-300",
      default: "bg-[#FFCCD5]",
    };

    const bgColor =
      flavorColors[cakeFlavor.toLowerCase()] || flavorColors.default;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        {/* Visual Cake Representation */}
        <div className="relative mb-2">
          {/* Cake Shape */}
          <div
            className={`w-16 h-12 ${bgColor} ${
              cakeShape.toLowerCase() === "square"
                ? "rounded-lg"
                : "rounded-full"
            } shadow-md border border-pink-100 flex items-center justify-center`}
          >
            {/* Cake Layers */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-white/40 rounded-full"></div>

            {/* Decorative dots */}
            <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
            <div className="absolute top-2 right-3 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          </div>

          {/* Cake Plate */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Flavor Tag */}
        <div className="px-2 py-0.5 bg-white text-[#e11d48] text-[8px] font-bold rounded-full border border-pink-100">
          {cakeFlavor}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#fff0f3] min-h-screen p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#333333] mb-2">
            Your Cart
          </h1>
          <p className="text-[#555555]">Review your delicious selection</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-[2.5rem] shadow-sm border border-pink-100">
            <div className="text-gray-300 text-6xl md:text-7xl mb-6">🛒</div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#333333] mb-3">
              Your cart is empty
            </h2>
            <p className="text-[#555555] mb-8 px-4">
              Add some delicious items to get started!
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="px-8 py-3.5 bg-[#e11d48] text-white rounded-full hover:bg-[#be123c] transition-colors font-bold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN - PRODUCTS */}
            <div className="lg:w-2/3 w-full">
              <div className="space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const isCustom = isCustomCake(item);

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-center justify-center sm:justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-pink-100 hover:shadow-md transition-shadow gap-4"
                    >
                      {/* Image/Custom Cake Display */}
                      <div className="relative w-full sm:w-32 md:w-40 h-32 md:h-40 rounded-xl overflow-hidden border border-pink-50 flex-shrink-0 bg-[#FFCCD5]">
                        {isCustom ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2">
                            {renderCustomCakeDisplay(item)}
                            <div className="absolute top-2 right-2">
                              {renderCustomCakeBadge()}
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.image || item.img || "/cake5.jpg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/Image/default.avif";
                            }}
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 text-center sm:text-left w-full">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-3 gap-2">
                          <div className="text-center sm:text-left">
                            <h4 className="text-lg md:text-xl font-bold text-[#333333]">
                              {item.name}
                            </h4>
                            {isCustom && (
                              <div className="mt-1 flex items-center justify-center sm:justify-start gap-1">
                                <span className="px-2 py-1 bg-pink-50 text-[#e11d48] text-[10px] font-bold rounded-full border border-pink-100 uppercase tracking-wider">
                                  Unique Order
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Price Display */}
                          <div className="text-center sm:text-right">
                            <p className="text-[#555555] text-sm">
                              ₹{item.price.toFixed(2)} each
                            </p>
                            <p className="text-[#e11d48] font-bold text-base md:text-lg">
                              Total: ₹{(item.price * item.qty).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Custom Cake Details */}
                        {isCustom && renderCustomCakeDetails(item)}

                        {/* For non-custom items */}
                        {!isCustom && (
                          <p className="text-[#888888] text-sm mt-2 text-center sm:text-left">
                            Baked fresh and ready!
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center gap-3 md:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 md:gap-3 bg-pink-50 p-1.5 rounded-full border border-pink-100">
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-[#e11d48] hover:text-white transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                            onClick={() => dispatch(decreaseQty(item.id))}
                            disabled={item.qty <= 1}
                          >
                            <span className="text-lg font-bold">−</span>
                          </button>
                          <span className="text-base font-bold w-6 text-center text-[#333333]">
                            {item.qty}
                          </span>
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-[#e11d48] hover:text-white transition-colors shadow-sm"
                            onClick={() => dispatch(increaseQty(item.id))}
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>

                        <button
                          className="text-[#e11d48] hover:text-white text-xl p-2.5 hover:bg-[#e11d48] rounded-full transition-colors border border-pink-200"
                          onClick={() => dispatch(deleteItem(item.id))}
                          title="Remove item"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                <button
                  onClick={() => navigate("/menu")}
                  className="px-6 py-3 bg-white border-2 border-[#e11d48] text-[#e11d48] rounded-full hover:bg-[#fff0f3] transition-colors font-bold w-full sm:w-auto text-center shadow-sm"
                >
                  ← Continue Shopping
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate("/customize")}
                    className="px-6 py-3 bg-[#333333] text-white rounded-full hover:bg-black transition-colors font-bold shadow-md w-full sm:w-auto text-center"
                  >
                    + Custom Cake
                  </button>

                  <button
                    onClick={() => {
                      dispatch(clearCart());
                      toast.success("Cart cleared successfully");
                    }}
                    className="px-6 py-3 bg-white text-[#555555] border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:text-black transition-colors font-bold w-full sm:w-auto text-center"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CHECKOUT SUMMARY */}
            <div className="lg:w-1/3 w-full flex justify-center lg:justify-end lg:sticky lg:top-28">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-pink-100 w-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#333333] mb-2 text-center sm:text-left">
                    Order Summary
                  </h3>
                  <div className="w-16 h-1 bg-[#e11d48] rounded-full mx-auto sm:mx-0"></div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[#555555] pb-3 border-b border-pink-50">
                    <span>Items ({items.length})</span>
                    <span className="font-semibold text-[#333333]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#555555] pb-3 border-b border-pink-50">
                    <span>Tax (10%)</span>
                    <span className="font-semibold text-[#333333]">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#555555] pb-3 border-b border-pink-50">
                    <span>Delivery</span>
                    <span className="font-semibold text-[#333333]">
                      {delivery === 0 ? "Free" : `₹${delivery}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t-2 border-pink-100">
                    <span className="text-[#333333]">Total</span>
                    <span className="text-[#e11d48] text-2xl">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Custom Cake Information Box */}
                {items.some((item) => isCustomCake(item)) && (
                  <div className="mb-6 p-4 bg-[#fff0f3] rounded-2xl border border-pink-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⏰</div>
                      <div>
                        <p className="text-[#e11d48] font-bold mb-1 text-sm">
                          Custom Order Notice
                        </p>
                        <p className="text-xs text-[#555555]">
                          Your custom cake needs 2-3 days for prep. We'll contact you shortly to confirm details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <div className="sticky bottom-0 bg-white pt-2">
                  <button
                    onClick={handleProceedToOrder}
                    className="w-full py-4 bg-[#e11d48] text-white rounded-full text-lg font-bold hover:bg-[#be123c] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  >
                    <span>Proceed to Checkout</span>
                    <span className="text-xl">→</span>
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#555555] bg-gray-50 p-2 rounded-lg">
                    <div className="text-green-500">🔒</div>
                    <span className="font-medium">Secure Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#555555] bg-gray-50 p-2 rounded-lg">
                    <div className="text-[#e11d48]">🚚</div>
                    <span className="font-medium">Fast & Fresh Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;