import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";


const RecentOrder = () => {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isMobile, setIsMobile] = useState(window.innerWidth < 640); // ← ADD THIS


 // ← ADD THIS RESIZE HANDLER
 useEffect(() => {
   const handleResize = () => {
     setIsMobile(window.innerWidth < 640);
   };
  
   window.addEventListener('resize', handleResize);
   return () => window.removeEventListener('resize', handleResize);
 }, []);


 useEffect(() => {
   const fetchOrders = async () => {
     try {
       const res = await api.get("/api/admin/orders", {
         withCredentials: true,
         headers: {
           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
         },
       });
       const recent = res.data.orders
         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .slice(0, 5);
       setOrders(recent);
     } catch (err) {
       console.error("Failed to fetch orders", err);
     } finally {
       setLoading(false);
     }
   };
   fetchOrders();
 }, []);


 const getStatusColor = (status) => {
   switch (status) {
     case "delivered":
       return "bg-green-100 text-green-800";
     case "paid":
       return "bg-blue-100 text-blue-800";
     case "pending":
       return "bg-yellow-100 text-yellow-800";
     case "cancelled":
       return "bg-red-100 text-red-800";
     default:
       return "bg-gray-100 text-gray-800";
   }
 };


 if (loading) {
   return (
     <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
       <div className="text-center py-6 text-gray-500">Loading orders...</div>
     </div>
   );
 }


 return (
   <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg w-full">
     <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-[#e11d48]">
       Recent Orders
     </h3>


     {/* Mobile Card View */}
     {isMobile ? (
       <div className="space-y-3">
         {orders.length === 0 ? (
           <div className="text-center py-6 text-gray-500">No recent orders</div>
         ) : (
           orders.map((o) => (
             <div key={o._id} className="border border-gray-200 rounded-lg p-3 hover:bg-[#fff0f3] transition-all">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-semibold text-gray-800">
                   #{o._id.slice(-6).toUpperCase()}
                 </span>
                 <span
                   className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                     o.orderStatus
                   )}`}
                 >
                   {o.orderStatus}
                 </span>
               </div>
               <div className="text-sm text-gray-600 mb-1">
                 Customer: {o.shippingAddress?.name || "Guest"}
               </div>
               <div className="text-sm font-semibold text-[#e11d48]">
                 Amount: ₹{o.totalAmount.toFixed(0)}
               </div>
             </div>
           ))
         )}
       </div>
     ) : (
       /* Desktop Table View */
       <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse text-sm sm:text-base">
           <thead>
             <tr className="bg-[#fff0f3]">
               <th className="py-3 px-4 text-[#e11d48] font-semibold">Order ID</th>
               <th className="py-3 px-4 text-[#e11d48] font-semibold">Customer</th>
               <th className="py-3 px-4 text-[#e11d48] font-semibold">Amount</th>
               <th className="py-3 px-4 text-[#e11d48] font-semibold">Status</th>
              </tr>
           </thead>
           <tbody>
             {orders.length === 0 ? (
               <tr>
                 <td colSpan="4" className="text-center py-6 text-gray-500">
                   No recent orders
                 </td>
               </tr>
             ) : (
               orders.map((o) => (
                 <tr
                   key={o._id}
                   className="hover:bg-[#fff0f3] transition-all cursor-pointer border-b border-gray-100"
                 >
                   <td className="py-3 px-4 text-gray-800 font-medium">
                     #{o._id.slice(-6).toUpperCase()}
                   </td>
                   <td className="py-3 px-4 text-gray-700">
                     {o.shippingAddress?.name || "Guest"}
                   </td>
                   <td className="py-3 px-4 text-gray-700">
                     ₹{o.totalAmount.toFixed(0)}
                   </td>
                   <td className="py-3 px-4">
                     <span
                       className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                         o.orderStatus
                       )}`}
                     >
                       {o.orderStatus}
                     </span>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
     )}


     <div className="mt-4 flex justify-center sm:justify-end">
       <Link
         to="/admin/orders"
         className="px-4 py-2 bg-[#e11d48] text-white font-semibold rounded-lg shadow hover:bg-[#be123c] transition text-sm"
       >
         See More
       </Link>
     </div>
   </div>
 );
};


export default RecentOrder;
