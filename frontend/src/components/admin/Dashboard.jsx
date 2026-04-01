import React, { useEffect, useState } from "react"; // ← ADD THIS BACK
import StatsCards from "./StatsCards";
import SalesChart from "./SalesChart";
import OrdersPieChart from "./OrdersPieChart";
import RecentOrder from "./RecentOrder";
import Topbar from "./Topbar";


const Dashboard = () => {
 // Keep existing responsive state
 const [isCompact, setIsCompact] = useState(window.innerWidth < 1024);


 useEffect(() => {
   const handleResize = () => {
     setIsCompact(window.innerWidth < 1024);
   };


   window.addEventListener("resize", handleResize);
   return () => window.removeEventListener("resize", handleResize);
 }, []);


 return (
   <div className="flex flex-col min-h-screen bg-[#fff0f3] lg:ml-64 overflow-x-hidden">
     <Topbar />


     {/* PAGE CONTENT - FIXED SPACING */}
     <div className="px-4 sm:px-6 md:px-8 pt-4 pb-6 w-full max-w-full overflow-x-hidden">
       {/* Header - FIXED PL-12 ISSUE */}
       <div className="flex items-center justify-between mb-4 mt-2 sm:mt-0">
         <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#e11d48]">
           Dashboard
         </h2>
       </div>
      
       {/* STATS */}
       <StatsCards />


       {/* CHARTS */}
       {isCompact ? (
         /* 📱 MOBILE / TABLET */
         <div className="flex flex-col gap-4 mt-4">
           <div className="w-full">
             <SalesChart />
           </div>
           <div className="w-full flex justify-center">
             <div className="w-full max-w-[400px] md:max-w-[500px]">
               <OrdersPieChart />
             </div>
           </div>
         </div>
       ) : (
         /* 💻 DESKTOP */
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
           <SalesChart />
           <OrdersPieChart />
         </div>
       )}


       {/* RECENT ORDERS */}
       <div className="mt-6">
         <RecentOrder />
       </div>
     </div>
   </div>
 );
};


export default Dashboard;


