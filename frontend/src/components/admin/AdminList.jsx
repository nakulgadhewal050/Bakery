import React, { useEffect, useState } from "react";
import api from "../../api/axios";


const AdminList = () => {
 const [admins, setAdmins] = useState([]);
 const [loading, setLoading] = useState(true);
 const [currentAdminRole, setCurrentAdminRole] = useState(null);
 const [currentAdminId, setCurrentAdminId] = useState(null);


 const getAdminInfo = () => {
   const token = localStorage.getItem("adminToken");
   if (!token) return { role: null, id: null };


   try {
     const payload = JSON.parse(atob(token.split(".")[1]));
     return { role: payload.role, id: payload.id };
   } catch {
     return { role: null, id: null };
   }
 };


 const fetchAdmins = async () => {
   try {
     const token = localStorage.getItem("adminToken");


     const res = await api.get("/api/admin/admins", {
       headers: { Authorization: `Bearer ${token}` },
     });


     const adminsData = res.data.admins || [];


     const superAdmins = adminsData.filter(
       (a) => a.role === "super-admin"
     );


     const normalAdmins = adminsData
       .filter((a) => a.role !== "super-admin")
       .sort(
         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
       );


     setAdmins([...superAdmins, ...normalAdmins]);
   } catch (err) {
     console.error("Fetch error:", err);
   } finally {
     setLoading(false);
   }
 };


 const deleteAdmin = async (id) => {
   if (id === currentAdminId) {
     alert("You cannot delete your own account!");
     return;
   }


   const yes = window.confirm("Are you sure?");
   if (!yes) return;


   try {
     const token = localStorage.getItem("adminToken");


     await api.delete(`/api/admin/${id}`, {
       headers: { Authorization: `Bearer ${token}` },
     });


     setAdmins((prev) => prev.filter((a) => a._id !== id));
     alert("Deleted!");
   } catch (err) {
     console.error("Delete error:", err);
     alert(err.response?.data?.message || "Failed");
   }
 };


 useEffect(() => {
   const { role, id } = getAdminInfo();
   setCurrentAdminRole(role);
   setCurrentAdminId(id);
   fetchAdmins();
 }, []);


 const shouldShowDeleteButton = (admin) => {
   if (currentAdminRole !== "super-admin") return false;
   if (admin.role === "super-admin") return false;
   if (admin._id === currentAdminId) return false;
   return true;
 };


 return (
   <div className="p-4 sm:p-6 lg:p-8 lg:ml-64">
     <div className="flex items-center justify-between mb-4 pt-1 lg:pt-0 pl-13 lg:pl-0">
       <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
         <span className="text-black">Admin </span>
         <span className="text-[#e11d48]">Accounts</span>
       </h2>
       <div className="text-sm px-3 py-1 bg-[#e11d48] text-white rounded-lg">
         Your Role:{" "}
         <span className="font-bold">
           {currentAdminRole || "Unknown"}
         </span>
       </div>
     </div>


     {loading ? (
       <div className="flex justify-center py-12">
         <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#e11d48] rounded-full"></div>
       </div>
     ) : admins.length === 0 ? (
       <div className="text-center py-12 bg-white rounded-xl border">
         <p>No admins found.</p>
       </div>
     ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 lg:mt-0">
         {admins.map((admin) => (
           <div
             key={admin._id}
             className={`w-full bg-white border border-[#ffe4ea] rounded-xl shadow-sm p-5 flex flex-col gap-4 hover:bg-[#fff1f5] hover:shadow-md transition ${
               admin._id === currentAdminId
                 ? "ring-2 ring-[#e11d48]"
                 : ""
             }`}
           >
             {/* ADMIN INFO */}
             <div>
               <h3 className="text-lg font-semibold text-[#e11d48]">
                 {admin.name}
                 {admin._id === currentAdminId && (
                   <span className="ml-2 text-xs px-2 py-0.5 bg-[#e11d48] text-white rounded-full">
                     You
                   </span>
                 )}
               </h3>


               <p className="text-sm text-[#e11d48] flex items-center mt-1">
                 <i className="bx bx-envelope mr-1"></i>
                 {admin.email}
               </p>


               <p className="text-xs text-gray-500 mt-1">
                 Created:{" "}
                 {new Date(admin.createdAt).toLocaleDateString()}
               </p>


               {/* ROLE */}
               <div className="mt-3">
                 <span
                   className={`px-3 py-1 text-xs rounded-full font-semibold ${
                     admin.role === "super-admin"
                       ? "bg-[#e11d48] text-white"
                       : "bg-[#ffe4ea] text-[#e11d48]"
                   }`}
                 >
                   {admin.role}
                 </span>
               </div>
             </div>


             {/* ACTION - BOTTOM RIGHT */}
             <div className="mt-auto text-right">
               {shouldShowDeleteButton(admin) ? (
                 <button
                   onClick={() => deleteAdmin(admin._id)}
                   className="px-4 py-2 bg-[#e11d48] text-white rounded-lg hover:bg-[#be123c] hover:shadow-md transition flex items-center gap-1 ml-auto"
                 >
                   <i className="bx bx-trash"></i>
                   Delete
                 </button>
               ) : (
                 <div className="text-xs text-gray-400 italic">
                   {admin.role === "super-admin"
                     ? "Super Admin"
                     : admin._id === currentAdminId
                     ? "Your account"
                     : "Cannot delete"}
                 </div>
               )}
             </div>
           </div>
         ))}
       </div>
     )}
   </div>
 );
};


export default AdminList;
