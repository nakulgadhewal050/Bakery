/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"; // ← Add this if missing
import { Calendar, Clock, CreditCard, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";


const StatsCards = () => {
 const [stats, setStats] = useState({
   totalOrders: 0,
   todayOrders: 0,
   revenueToday: 0,
   pendingOrders: 0,
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   let isMounted = true;

   const fetchStats = async () => {
     setLoading(true);
     try {
       const res = await api.get("/api/admin/orders", {
         withCredentials: true,
         headers: {
           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
         },
       });

       const orders = res.data?.orders || [];
       const startOfDay = new Date();
       startOfDay.setHours(0, 0, 0, 0);

       const totalOrders = orders.length;
       const todayOrders = orders.filter((order) =>
         new Date(order.createdAt) >= startOfDay
       ).length;

       const pendingOrders = orders.filter((order) =>
         ["pending", "created", "confirmed", "preparing", "out-for-delivery"].includes(
           order.orderStatus
         )
       ).length;

       const revenueToday = orders
         .filter((order) => order.paymentStatus === "paid")
         .filter((order) => {
           const paidAt = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
           return paidAt >= startOfDay;
         })
         .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

       if (isMounted) {
         setStats({ totalOrders, todayOrders, revenueToday, pendingOrders });
       }
     } catch (error) {
       console.error("Failed to fetch admin stats", error);
     } finally {
       if (isMounted) setLoading(false);
     }
   };

   fetchStats();
   return () => {
     isMounted = false;
   };
 }, []);

 const formatCurrency = (value) =>
   new Intl.NumberFormat("en-IN", {
     style: "currency",
     currency: "INR",
     maximumFractionDigits: 0,
   }).format(value || 0);

 const statsConfig = [
   { label: "Total Orders", value: loading ? "..." : stats.totalOrders, icon: <ShoppingBag /> },
   { label: "Today's Orders", value: loading ? "..." : stats.todayOrders, icon: <Calendar /> },
   { label: "Revenue Today", value: loading ? "..." : formatCurrency(stats.revenueToday), icon: <CreditCard /> },
   { label: "Pending Orders", value: loading ? "..." : stats.pendingOrders, icon: <Clock /> },
 ];


 return (
   <div className="w-full">
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4 w-full">
      {statsConfig.map((s) => (
         <motion.div
           key={s.label}
           whileHover={{ scale: 1.02 }}
           className="flex items-center gap-3 p-3 sm:p-4 bg-[#fff0f3] rounded-2xl border border-[#e11d48] hover:shadow-md hover:border-[#fda4af] transition-all w-full"
         >
           {/* Icon - FIXED SIZING */}
           <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-[#ffe4e6] text-[#e11d48]">
             {React.cloneElement(s.icon, { size: 20, className: "w-5 h-5 sm:w-6 sm:h-6" })}
           </div>


           {/* Text */}
           <div className="flex-1 min-w-0">
             <p className="text-[#e11d48] text-xs sm:text-sm font-semibold truncate">
               {s.label}
             </p>
             <h2 className="text-sm sm:text-lg md:text-xl font-bold mt-1 text-[#e11d48] truncate">
               {s.value}
             </h2>
           </div>
         </motion.div>
       ))}
     </div>
   </div>
 );
};


export default StatsCards;
