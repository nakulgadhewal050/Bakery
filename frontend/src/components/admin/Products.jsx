import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import CreateProductModal from "./CreateProduct";
import UpdateProductModal from "./UpdateProduct";
import toast, { Toaster } from "react-hot-toast";


const Products = () => {
 const [products, setProducts] = useState([]);
 const [showModal, setShowModal] = useState(false);
 const [showUpdateModal, setShowUpdateModal] = useState(false);
 const [selectedProductId, setSelectedProductId] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [deleteProductId, setDeleteProductId] = useState(null);


 // 🔥 RESPONSIVE STATE (mobile + tablet + nest hub)
 const [isCompact, setIsCompact] = useState(window.innerWidth < 1280);


 useEffect(() => {
   const handleResize = () => {
     setIsCompact(window.innerWidth < 1280);
   };


   window.addEventListener("resize", handleResize);
   return () => window.removeEventListener("resize", handleResize);
 }, []);


 const fetchProducts = async () => {
   try {
     setLoading(true);
     setError("");


     const token = localStorage.getItem("adminToken");


     const res = await api.get("/api/admin/products", {
       headers: { Authorization: `Bearer ${token}` },
     });


     setProducts(res.data.products || []);
   } catch (err) {
     setError(err.response?.data?.message || "Failed to load products");
     toast.error(err.response?.data?.message || "Failed to load products");
   } finally {
     setLoading(false);
   }
 };


 useEffect(() => {
   fetchProducts();
 }, []);


 const handleSaveProduct = () => {
   toast.success("Product added successfully!");
   fetchProducts();
 };


 const handleDeleteProduct = async () => {
   try {
     const token = localStorage.getItem("adminToken");


     await api.delete(`/api/admin/product/${deleteProductId}`, {
       headers: { Authorization: `Bearer ${token}` },
     });


     setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
     setShowDeleteModal(false);
     setDeleteProductId(null);


     toast.success("Product deleted successfully!");
   } catch (error) {
     toast.error(error.response?.data?.message || "Failed to delete product");
   }
 };


 return (
   <div className="p-4 lg:ml-64">
     <Toaster position="top-right" />


     <div className="flex items-center justify-between mb-4 pt-2 lg:pt-0 pl-12 lg:pl-0">
       <h2 className="text-xl sm:text-2xl font-bold">Products</h2>
       <button
         onClick={() => setShowModal(true)}
         className="px-4 py-2 bg-[#e11d48] text-white rounded-2xl hover:bg-[#be123c]"
       >
         + Add New Product
       </button>
     </div>


     <div className="bg-white p-4 rounded-xl shadow">
       {isCompact ? (
         /* 📱📱📱 MOBILE + TABLET + NEST HUB */
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {loading ? (
             <p className="text-center py-4">Loading...</p>
           ) : error ? (
             <p className="text-center py-4 text-red-500">{error}</p>
           ) : products.length === 0 ? (
             <p className="text-center py-4">No products found</p>
           ) : (
             products.map((p) => (
               <div key={p._id} className="border-b border-[#f9d6dc] rounded-lg p-3 bg-[#fff9f4] flex flex-col gap-3">
                 <div className="border-b border-[#f9d6dc] pb-2 flex justify-between items-start">
                   <h3 className="font-semibold text-[#3f2e20] text-sm">{p.name}</h3>
                   <p className="text-lg font-bold text-[#e11d48]">₹{p.price}</p>
                 </div>

                 <div className="text-xs text-gray-700">
                   <p>
                     <span className="font-semibold">Category:</span> {p.category}
                   </p>
                 </div>

                 <div className="text-xs text-gray-700">
                   <p>
                     <span className="font-semibold">Stock:</span> {p.stock}
                   </p>
                 </div>

                 <div className="flex flex-col gap-2 mt-auto">
                   <button
                     onClick={() => {
                       setSelectedProductId(p._id);
                       setShowUpdateModal(true);
                     }}
                     className="w-full px-3 py-2 bg-[#fff0f3] text-[#e11d48] rounded-lg text-xs font-semibold hover:bg-[#ffe5ec] hover:shadow-md transition"
                   >
                     Update
                   </button>


                   <button
                     onClick={() => {
                       setDeleteProductId(p._id);
                       setShowDeleteModal(true);
                     }}
                     className="w-full px-3 py-2 bg-[#ff4d6d] text-white rounded-lg text-xs font-semibold hover:bg-[#e63956] hover:shadow-md transition"
                   >
                     Delete
                   </button>
                 </div>
               </div>
             ))
           )}
         </div>
       ) : (
         /* 💻 DESKTOP ONLY */
         <div className="overflow-x-auto">
           <table className="w-full min-w-[800px] border-collapse">
             <thead>
               <tr className="bg-[#fff0f3] text-[#3f2e20]">
                 <th className="py-4 px-5 text-left font-semibold">Product</th>
                 <th className="py-4 px-5 text-center font-semibold">
                   Category
                 </th>
                 <th className="py-4 px-5 text-center font-semibold">Price</th>
                 <th className="py-4 px-5 text-center font-semibold">Stock</th>
                 <th className="py-4 px-5 text-center font-semibold">Action</th>
               </tr>
             </thead>


             <tbody>
               {loading ? (
                 <tr>
                   <td colSpan="5" className="text-center py-5">
                     Loading...
                   </td>
                 </tr>
               ) : error ? (
                 <tr>
                   <td colSpan="5" className="text-center py-5 text-red-500">
                     {error}
                   </td>
                 </tr>
               ) : products.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="text-center py-5">
                     No products found
                   </td>
                 </tr>
               ) : (
                 products.map((p) => (
                   <tr key={p._id} className="hover:bg-[#fce7ed] border-b border-[#f9d6dc] transition-colors duration-300">
                     <td className="py-4 px-5 text-left">{p.name}</td>
                     <td className="py-4 px-5 text-center">{p.category}</td>
                     <td className="py-4 px-5 text-center font-semibold">₹{p.price}</td>
                     <td className="py-4 px-5 text-center">{p.stock}</td>
                     <td className="py-4 px-5 text-center">
                       <button
                         onClick={() => {
                           setSelectedProductId(p._id);
                           setShowUpdateModal(true);
                         }}
                         className="px-4 py-2 bg-[#fff0f3] text-[#e11d48] rounded-lg mr-2 font-semibold hover:bg-[#ffe5ec] hover:shadow-md transition"
                       >
                         Update
                       </button>


                       <button
                         onClick={() => {
                           setDeleteProductId(p._id);
                           setShowDeleteModal(true);
                         }}
                         className="px-4 py-2 bg-[#ff4d6d] text-white rounded-lg font-semibold hover:bg-[#e63956] hover:shadow-md transition"
                       >
                         Delete
                       </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
       )}
     </div>


     {/* MODALS */}
     {showModal && (
       <CreateProductModal
         onClose={() => setShowModal(false)}
         onSave={handleSaveProduct}
       />
     )}


     {showUpdateModal && (
       <UpdateProductModal
         productId={selectedProductId}
         onClose={() => setShowUpdateModal(false)}
       />
     )}


     {showDeleteModal && (
       <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
         <div className="bg-white w-[90%] max-w-md p-6 rounded-xl">
           <h3 className="text-xl font-semibold mb-4">Delete Product?</h3>
           <p className="mb-6">
             Are you sure you want to delete this product?
           </p>


           <div className="flex justify-end gap-3">
             <button
               onClick={() => setShowDeleteModal(false)}
               className="px-4 py-2 bg-gray-300 rounded-lg"
             >
               Cancel
             </button>


             <button
               onClick={handleDeleteProduct}
               className="px-4 py-2 bg-red-500 text-white rounded-lg"
             >
               Confirm Delete
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};


export default Products;


