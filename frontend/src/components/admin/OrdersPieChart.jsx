import React, { useEffect, useRef, useState } from "react"; // ← ADD THESE IMPORTS
import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts";


const OrdersPieChart = () => {
 const containerRef = useRef(null);
 const [isCompact, setIsCompact] = useState(false);


 const colors = ["#fda4af", "#e11d48", "#be123c"];
 const data = [
   { name: "Pending", value: 2 },
   { name: "Completed", value: 2 },
   { name: "Cancelled", value: 1 },
 ];


 useEffect(() => {
   if (!containerRef.current) return;


   const observer = new ResizeObserver((entries) => {
     const width = entries[0].contentRect.width;
     setIsCompact(width < 400); // Adjusted breakpoint
   });


   observer.observe(containerRef.current);
   return () => observer.disconnect();
 }, []);


 return (
   <div
     ref={containerRef}
     className="bg-[#fff0f3] p-4 rounded-xl shadow w-full"
   >
     <h3 className="text-sm sm:text-lg font-semibold mb-3 text-[#e11d48] text-center sm:text-left">
       Daily Order Status
     </h3>


     <div className="w-full flex justify-center">
       <div className="w-full max-w-[300px] sm:max-w-[350px] h-[200px] sm:h-[240px] mx-auto">
         <ResponsiveContainer width="100%" height="100%">
           <PieChart>
             <Pie
               data={data}
               dataKey="value"
               nameKey="name"
               outerRadius="70%"
               innerRadius="40%"
               paddingAngle={3}
               label={!isCompact}
             >
               {data.map((_, i) => (
                 <Cell key={i} fill={colors[i]} />
               ))}
             </Pie>
             <Tooltip />
           </PieChart>
         </ResponsiveContainer>
       </div>
     </div>


     <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
       {data.map((item, i) => (
         <div className="flex items-center gap-2" key={i}>
           <span
             className="w-3 h-3 rounded-full"
             style={{ backgroundColor: colors[i] }}
           />
           <span className="text-[#e11d48]">{item.name}</span>
         </div>
       ))}
     </div>
   </div>
 );
};


export default OrdersPieChart;
