import React, { useEffect, useState } from "react";
import api from "../../api/axios";


const AllUsers = () => {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);


 const [showModal, setShowModal] = useState(false);
 const [modalAction, setModalAction] = useState(null);
 const [selectedUser, setSelectedUser] = useState(null);


 const [isCompact, setIsCompact] = useState(window.innerWidth < 1024);


 useEffect(() => {
   const handleResize = () => {
     setIsCompact(window.innerWidth < 1024);
   };


   window.addEventListener("resize", handleResize);
   return () => window.removeEventListener("resize", handleResize);
 }, []);


 const token = localStorage.getItem("adminToken");


 const fetchUsers = async () => {
   try {
     const res = await api.get("/api/admin/users", {
       headers: { Authorization: `Bearer ${token}` },
     });


     setUsers(res.data.users || []);
   } catch (err) {
     console.error("Fetch users error:", err);
   } finally {
     setLoading(false);
   }
 };


 useEffect(() => {
   fetchUsers();
 }, []);


 const openModal = (user, action) => {
   setSelectedUser(user);
   setModalAction(action);
   setShowModal(true);
 };


 const confirmAction = async () => {
   if (!selectedUser || !modalAction) return;


   try {
     if (modalAction === "delete") {
       await api.delete(`/api/admin/user/${selectedUser._id}`, {
         headers: { Authorization: `Bearer ${token}` },
       });


       setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
     } else {
       const shouldBlock = modalAction === "block";


       await api.patch(
         `/api/admin/user/block/${selectedUser._id}`,
         { blocked: shouldBlock },
         { headers: { Authorization: `Bearer ${token}` } }
       );


       setUsers((prev) =>
         prev.map((u) =>
           u._id === selectedUser._id
             ? { ...u, isBlocked: shouldBlock }
             : u
         )
       );
     }


     setShowModal(false);
     setSelectedUser(null);
   } catch (err) {
     alert(err.response?.data?.message || "Action failed!");
   }
 };


 return (
   <div className="p-4 lg:ml-64">
     <div className="flex items-center mb-4 pt-2 lg:pt-0 pl-12 lg:pl-0">
       <h2 className="text-xl sm:text-3xl font-bold text-gray-800">
         All <span className="text-[#e11d48]">Users</span>
       </h2>
     </div>


     {loading ? (
       <p className="text-center text-gray-600">Loading users...</p>
     ) : users.length === 0 ? (
       <p className="text-center text-gray-500">No users found.</p>
     ) : (
       <div className="space-y-4">
         {users.map((user) => (
           <div
             key={user._id}
             className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 ${
               isCompact ? "space-y-3" : "flex justify-between items-center"
             }`}
           >
             {/* USER DETAILS */}
             <div>
               <h3 className="text-lg font-semibold text-gray-900">
                 {user.name}
               </h3>
               <p className="text-sm text-gray-600">{user.email}</p>


               {user.phone && (
                 <p className="text-sm text-gray-600">📞 {user.phone}</p>
               )}


               <p className="text-xs text-gray-400 mt-1">
                 Joined: {new Date(user.createdAt).toLocaleDateString()}
               </p>

               <p className="text-sm text-gray-700 mt-1">
                 Total Orders: <span className="font-semibold">{user.totalOrders ?? 0}</span>
               </p>


               {user.isBlocked && (
                 <span className="text-red-500 text-xs font-semibold">
                   BLOCKED
                 </span>
               )}
             </div>


             {/* ACTION BUTTONS */}
             <div className={`flex gap-3 ${isCompact ? "pt-2" : ""}`}>
               <button
                 onClick={() =>
                   openModal(user, user.isBlocked ? "unblock" : "block")
                 }
                 className={`px-4 py-2 rounded-lg font-medium transition ${
                   user.isBlocked
                     ? "bg-green-500 hover:bg-green-600 text-white"
                     : "bg-[#fff0f3] hover:bg-[#ffe5ec] text-black"
                 }`}
               >
                 {user.isBlocked ? "Unblock" : "Block"}
               </button>


               <button
                 onClick={() => openModal(user, "delete")}
                 className="px-4 py-2 bg-[#ff4d6d] text-white rounded-lg font-medium hover:bg-[#e63956] transition"
               >
                 Delete
               </button>
             </div>
           </div>
         ))}
       </div>
     )}


     {/* CONFIRMATION MODAL */}
     {showModal && (
       <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
         <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-xl">
           <h3 className="text-xl font-semibold mb-4">
             {modalAction === "delete"
               ? "Delete User?"
               : modalAction === "block"
               ? "Block User?"
               : "Unblock User?"}
           </h3>


           <p className="text-gray-600 mb-6">
             {modalAction === "delete"
               ? "This action is permanent."
               : modalAction === "block"
               ? "User will not be able to access the system."
               : "User access will be restored."}
           </p>


           <div className="flex justify-end gap-3">
             <button
               onClick={() => setShowModal(false)}
               className="px-4 py-2 bg-gray-300 rounded-lg"
             >
               Cancel
             </button>


             {/* ✅ FIXED BUTTON */}
             <button
               onClick={confirmAction}
               className={`px-4 py-2 rounded-lg ${
                 modalAction === "delete"
                   ? "bg-[#ff4d6d] text-white"
                   : modalAction === "block"
                   ? "bg-[#fff0f3] text-black"
                   : "bg-green-500 text-white"
               }`}
             >
               Confirm
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};


export default AllUsers;

