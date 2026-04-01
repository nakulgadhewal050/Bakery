/* eslint-disable no-unused-vars */
import React from "react"; // ← Add this if missing
import { Calendar, Clock, CreditCard, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";


const StatsCards = () => {
 const stats = [
   { label: "Total Orders", value: 1200, icon: <ShoppingBag /> },
   { label: "Today's Orders", value: 42, icon: <Calendar /> },
   { label: "Revenue Today", value: "₹8,450", icon: <CreditCard /> },
   { label: "Pending Orders", value: 15, icon: <Clock /> },
 ];


 return (
   <div className="w-full">
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4 w-full">
       {stats.map((s) => (
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
