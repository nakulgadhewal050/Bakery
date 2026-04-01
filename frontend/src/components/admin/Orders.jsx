import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaSync,
} from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Status options for filtering
  const statusOptions = [
    { value: "All", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "out-for-delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Status badge styling
  const statusColors = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <FaClock className="inline mr-1" />,
    },
    confirmed: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: <FaCheckCircle className="inline mr-1" />,
    },
    preparing: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: <FaSync className="inline mr-1" />,
    },
    "out-for-delivery": {
      bg: "bg-purple-100",
      text: "text-purple-800",
      icon: <FaTruck className="inline mr-1" />,
    },
    delivered: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <FaCheckCircle className="inline mr-1" />,
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <FaTimesCircle className="inline mr-1" />,
    },
  };

  // Payment status styling
  const paymentStatusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    paid: { bg: "bg-green-100", text: "text-green-800" },
    failed: { bg: "bg-red-100", text: "text-red-800" },
    refunded: { bg: "bg-gray-100", text: "text-gray-800" },
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await api.get("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.orderStatus === filter);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate total revenue
  const totalRevenue = orders
    .filter((order) => order.orderStatus === "delivered")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate pending orders count
  const pendingOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "out-for-delivery"].includes(
      order.orderStatus
    )
  ).length;

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await api.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      const response = await api.delete(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Order deleted successfully");
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  // Close order details modal
  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="p-6 ">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e11d48]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:ml-64 overflow-x-hidden">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#e11d48] mb-2">
          Orders Management
        </h2>
        <p className="text-gray-600">Manage all customer orders from here</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-[#fff0f3] p-4 md:p-6 rounded-2xl shadow-md border border-[#e11d48]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl md:text-2xl font-bold text-[#e11d48]">
                {orders.length}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fff0f3] flex items-center justify-center flex-shrink-0">
              <span className="text-[#e11d48] text-lg md:text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-[#fff0f3] p-4 md:p-6 rounded-2xl shadow-md border border-[#e11d48]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-xl md:text-2xl font-bold text-[#e11d48]">
                {pendingOrders}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fff0f3] flex items-center justify-center flex-shrink-0">
              <span className="text-[#e11d48] text-lg md:text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-[#fff0f3] p-4 md:p-6 rounded-2xl shadow-md border border-[#e11d48]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl md:text-2xl font-bold text-[#e11d48]">
                ₹{totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fff0f3] flex items-center justify-center flex-shrink-0">
              <span className="text-[#e11d48] text-lg md:text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-[#fff0f3] p-4 md:p-6 rounded-2xl shadow-md border border-[#e11d48]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Orders</p>
              <p className="text-xl md:text-2xl font-bold text-[#e11d48]">
                {
                  orders.filter((order) => {
                    const today = new Date().toDateString();
                    const orderDate = new Date(order.createdAt).toDateString();
                    return today === orderDate;
                  }).length
                }
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fff0f3] flex items-center justify-center flex-shrink-0">
              <span className="text-[#e11d48] text-lg md:text-xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        {statusOptions.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`
              px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200
              shadow-sm border text-xs md:text-sm whitespace-nowrap flex-shrink-0
              ${
                filter === status.value
                  ? "bg-[#e11d48] text-white border-transparent"
                  : "bg-white text-[#e11d48] border-[#fda4af] hover:bg-[#fff0f3]"
              }
            `}
          >
            {status.label}
          </button>
        ))}

        <button
          onClick={fetchOrders}
          className="px-3 py-2 md:px-4 md:py-2 bg-[#fff0f3] text-[#e11d48] rounded-lg hover:bg-[#ffe4e6] transition flex items-center gap-2 text-xs md:text-sm whitespace-nowrap flex-shrink-0"
        >
          <FaSync className="text-xs md:text-sm" /> Refresh
        </button>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-[#e11d48] overflow-hidden">
{filteredOrders.length === 0 ? (
  <div className="text-center py-8 md:py-12">
    <div className="text-[#e11d48] text-5xl md:text-6xl mb-4">📦</div>
    <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
      No Orders Found
    </h3>
    <p className="text-gray-500 text-sm md:text-base">
      {filter === "All"
        ? "No orders have been placed yet."
        : `No orders with status "${filter}" found.`}
    </p>
  </div>
) : (
  <>
    {/* ================= 💻 DESKTOP TABLE ================= */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-full">
        <thead>
          <tr className="bg-[#fff0f3] text-[#e11d48]">
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Order ID
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Customer
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Items
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Total
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Status
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Payment
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Date
            </th>
            <th className="py-3 px-3 md:px-4 text-left text-xs md:text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-[#e11d48] hover:bg-[#fff0f3]"
            >
              <td className="py-3 px-3 md:px-4 text-xs md:text-sm font-semibold">
                #{order._id.toString().slice(-8).toUpperCase()}
              </td>

              <td className="py-3 px-3 md:px-4">
                <div className="text-xs md:text-sm font-medium">
                  {order.user?.name || "Customer"}
                </div>
                <div className="text-xs text-gray-500">
                  {order.user?.email || "N/A"}
                </div>
              </td>

              <td className="py-3 px-3 md:px-4 text-xs md:text-sm">
                {order.items.length} items
              </td>

              <td className="py-3 px-3 md:px-4 text-xs md:text-sm font-bold">
                ₹{order.totalAmount.toFixed(2)}
              </td>

              <td className="py-3 px-3 md:px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    statusColors[order.orderStatus]?.bg
                  } ${statusColors[order.orderStatus]?.text}`}
                >
                  {order.orderStatus}
                </span>
              </td>

              <td className="py-3 px-3 md:px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    paymentStatusColors[order.paymentStatus]?.bg
                  } ${paymentStatusColors[order.paymentStatus]?.text}`}
                >
                  {order.paymentStatus}
                </span>
              </td>

              <td className="py-3 px-3 md:px-4 text-xs md:text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </td>

              <td className="py-3 px-3 md:px-4">
                <div className="flex gap-2">
  {/* View */}
  <button
    onClick={() => viewOrderDetails(order)}
    className="px-2 py-1 bg-[#fff0f3] text-[#e11d48] rounded text-xs flex items-center gap-1"
    title="View"
  >
    <FaEye />
    <span className="hidden sm:inline">View</span>
  </button>

  {/* Status */}
  <select
    value={order.orderStatus}
    onChange={(e) =>
      updateOrderStatus(order._id, e.target.value)
    }
    className="px-2 py-1 bg-white border border-[#e11d48] rounded text-xs"
  >
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="preparing">Preparing</option>
    <option value="out-for-delivery">
      Out for Delivery
    </option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
  </select>

  {/* 🔴 DELETE */}
  <button
    onClick={() => deleteOrder(order._id)}
    className="px-2 py-1 bg-[#fff0f3] text-[#e11d48] rounded text-xs flex items-center gap-1"
    title="Delete"
  >
    <FaTrash />
    <span className="hidden sm:inline">Delete</span>
  </button>
</div>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ================= 📱 MOBILE CARDS ================= */}
    <div className="md:hidden space-y-4 mt-2">
      {filteredOrders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-xl shadow-md border border-[#e11d48] p-4"
        >
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-semibold text-sm">
                Order #{order._id.toString().slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                statusColors[order.orderStatus]?.bg
              } ${statusColors[order.orderStatus]?.text}`}
            >
              {order.orderStatus}
            </span>
          </div>

          <p className="text-sm mb-1">
            <strong>Customer:</strong> {order.user?.name || "Customer"}
          </p>
          <p className="text-sm mb-1">
            <strong>Items:</strong> {order.items.length}
          </p>
          <p className="font-bold text-sm mb-3">
            Total: ₹{order.totalAmount.toFixed(2)}
          </p>

         <div className="flex gap-2">
  {/* View */}
  <button
    onClick={() => viewOrderDetails(order)}
    className="flex-1 py-2 bg-[#fff0f3] text-[#e11d48] rounded text-sm flex items-center justify-center gap-1"
  >
    <FaEye /> View
  </button>

  {/* Delete */}
  <button
    onClick={() => deleteOrder(order._id)}
    className="flex-1 py-2 bg-[#fff0f3] text-[#e11d48] rounded text-sm flex items-center justify-center gap-1"
  >
    <FaTrash /> Delete
  </button>
</div>

{/* Status Dropdown (neeche alag row me, UX better) */}
<select
  value={order.orderStatus}
  onChange={(e) =>
    updateOrderStatus(order._id, e.target.value)
  }
  className="w-full mt-2 py-2 bg-[#fff0f3] rounded text-sm"
>
  <option value="pending">Pending</option>
  <option value="confirmed">Confirmed</option>
  <option value="preparing">Preparing</option>
  <option value="out-for-delivery">
    Out for Delivery
  </option>
  <option value="delivered">Delivered</option>
  <option value="cancelled">Cancelled</option>
</select>

        </div>
      ))}
    </div>
  </>
)}


      </div>

      {/* Order Details Modal - FIXED OVERFLOW */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-4">
            {/* Modal Header - Fixed */}
            <div className="p-4 md:p-6 border-b border-[#e11d48] flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#e11d48]">
                    Order Details
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Order #
                    {selectedOrder._id.toString().slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={closeOrderDetails}
                  className="text-[#e11d48] hover:text-[#be123c] text-xl md:text-2xl w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-[#fff0f3] transition flex-shrink-0"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                  <h4 className="font-bold text-[#e11d48] mb-2 text-sm md:text-base">
                    Customer Information
                  </h4>
                  <div className="bg-[#fff0f3] p-3 md:p-4 rounded-lg">
                    <p className="mb-1 md:mb-2 text-sm">
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.user?.name || "N/A"}
                    </p>
                    <p className="mb-1 md:mb-2 text-sm">
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.user?.email || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedOrder.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#e11d48] mb-2 text-sm md:text-base">
                    Order Information
                  </h4>
                  <div className="bg-[#fff0f3] p-3 md:p-4 rounded-lg">
                    <p className="mb-1 md:mb-2 text-sm">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          statusColors[selectedOrder.orderStatus]?.bg
                        } ${statusColors[selectedOrder.orderStatus]?.text}`}
                      >
                        {selectedOrder.orderStatus}
                      </span>
                    </p>
                    <p className="mb-1 md:mb-2 text-sm">
                      <span className="font-medium">Payment:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          paymentStatusColors[selectedOrder.paymentStatus]?.bg
                        } ${
                          paymentStatusColors[selectedOrder.paymentStatus]?.text
                        }`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </p>
                    <p className="mb-1 md:mb-2 text-sm">
                      <span className="font-medium">Method:</span>{" "}
                      {selectedOrder.paymentMethod}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-4 md:mb-6">
                <h4 className="font-bold text-[#e11d48] mb-2 text-sm md:text-base">
                  Shipping Address
                </h4>
                <div className="bg-[#fff0f3] p-3 md:p-4 rounded-lg">
                  <p className="mb-1 text-sm">
                    {selectedOrder.shippingAddress?.street || "N/A"}
                  </p>
                  <p className="mb-1 text-sm">
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state}
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress?.zipCode} -{" "}
                    {selectedOrder.shippingAddress?.country}
                  </p>
                </div>
              </div>

              {/* Order Items - FIXED OVERFLOW */}
              <div className="mb-4 md:mb-6">
                <h4 className="font-bold text-[#e11d48] mb-2 text-sm md:text-base">
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] md:min-w-full">
                    <thead>
                      <tr className="bg-[#fff0f3] text-[#e11d48] text-xs md:text-sm">
                        <th className="py-2 px-2 md:px-3 text-left">Item</th>
                        <th className="py-2 px-2 md:px-3 text-left">
                          Quantity
                        </th>
                        <th className="py-2 px-2 md:px-3 text-left">Price</th>
                        <th className="py-2 px-2 md:px-3 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-[#e11d48] hover:bg-[#fff0f3]"
                        >
                          <td className="py-2 md:py-3 px-2 md:px-3">
                            <div className="flex items-center gap-2 md:gap-3">
                              {item.img && (
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  className="w-8 h-8 md:w-12 md:h-12 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-xs md:text-sm truncate">
                                  {item.name}
                                </p>
                                {item.variation && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {item.variation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-3">
                            <div className="font-medium text-xs md:text-sm">
                              {item.qty}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-3">
                            <div className="font-medium text-xs md:text-sm">
                              ₹{item.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-3">
                            <div className="font-bold text-xs md:text-sm text-[#e11d48">
                              ₹{(item.price * item.qty).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#fff0f3] p-3 md:p-4 rounded-lg">
                <h4 className="font-bold text-[#e11d48] mb-2 text-sm md:text-base">
                  Order Summary
                </h4>
                <div className="space-y-1 md:space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      ₹
                      {selectedOrder.subtotal?.toFixed(2) ||
                        selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{selectedOrder.tax?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span>₹{selectedOrder.deliveryCharge || "0.00"}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base md:text-lg border-t border-[#e11d48] pt-2 mt-2">
                    <span>Total Amount:</span>
                    <span className="text-[#e11d48]">
                      ₹{selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="p-4 md:p-6 border-t border-[#e11d48] flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                <button
                  onClick={closeOrderDetails}
                  className="px-3 py-2 md:px-4 md:py-2 bg-[#fff0f3] text-[#e11d48] rounded-lg hover:bg-[#ffe4e6] transition font-medium text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Print order
                    window.print();
                  }}
                  className="px-3 py-2 md:px-4 md:py-2 bg-[#e11d48] text-white rounded-lg hover:bg-[#be123c] transition font-medium text-sm md:text-base"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;