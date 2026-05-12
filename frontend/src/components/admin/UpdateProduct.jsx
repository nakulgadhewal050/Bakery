import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function UpdateProductModal({ productId, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    tags: "",
    isFeatured: false,
    flavour: "",
    weight: "",
  });

  // Image Management States
  const [images, setImages] = useState([]); // New files to be uploaded
  const [previewUrls, setPreviewUrls] = useState([]); // Previews for new files
  const [existingImages, setExistingImages] = useState([]); // Images already on the server

  const [loading, setLoading] = useState(true);
  const [flavourOptions, setFlavourOptions] = useState([]);
  const [weightOptions, setWeightOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchProductAndOptions = async () => {
      try {
        const [productRes, allProductsRes] = await Promise.all([
          api.get(`/api/product/single/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/api/product`),
        ]);

        const p = productRes.data.product || {};
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price?.toString() || "",
          category: p.category || "",
          stock: p.stock?.toString() || "",
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          isFeatured: p.isFeatured || false,
          flavour: p.flavour || "",
          weight: p.weight || "",
        });

        // Load existing images from DB
        setExistingImages(p.images || []);

        const products = allProductsRes.data.products || [];
        setFlavourOptions([...new Set(products.map((p) => p.flavour).filter(Boolean))]);
        setWeightOptions([...new Set(products.map((p) => p.weight).filter(Boolean))]);
        setCategoryOptions([...new Set(products.map((p) => p.category).filter(Boolean))]);
        const allTags = products.flatMap((p) => Array.isArray(p.tags) ? p.tags : []).filter(Boolean);
        setTagOptions([...new Set(allTags)]);

      } catch (error) {
        toast.error("Failed to load product!");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndOptions();
  }, [productId, token, onClose]);

  // --- Image Handlers ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      toast.error("Some images exceed 10MB limit.");
    }

    setImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && images.length === 0) {
      return toast.error("At least one image is required!");
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock", form.stock);
      formData.append("isFeatured", form.isFeatured);
      formData.append("flavour", form.flavour);
      formData.append("weight", form.weight);
      
      const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      tagsArray.forEach(tag => formData.append("tags", tag));

      // Append existing images list (to keep)
      existingImages.forEach(img => formData.append("existingImages", img));

      // Append new files
      images.forEach(file => formData.append("images", file));

      await api.put(`/api/product/update/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product updated successfully!");
      setTimeout(() => { onClose(); window.location.reload(); }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be123c]"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-2xl hover:text-red-500" onClick={onClose} disabled={submitting}>✖</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PRODUCT INFO FIELDS */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Product Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded" required />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded" rows="3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded" required min="0" />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Stock *</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded" required min="0" />
            </div>
          </div>

          {/* CATEGORY & OPTIONS */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Category *</label>
            <div className="flex gap-2">
              <select name="category" onChange={handleChange} value={form.category} className="border border-gray-300 p-3 rounded w-[40%]" required>
                <option value="">Select</option>
                {categoryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Or new category" value={form.category} onChange={(e) => setForm(p => ({...p, category: e.target.value}))} className="border border-gray-300 p-3 rounded w-[60%]" />
            </div>
          </div>

          {/* FEATURED CHECKBOX */}
          <div className="flex gap-3 items-center p-3 bg-gray-50 rounded">
            <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-5 h-5 accent-[#be123c]" />
            <label htmlFor="isFeatured" className="font-medium text-gray-700 cursor-pointer">Mark as Featured Product</label>
          </div>

          {/* IMAGE SECTION (MOVED HERE) */}
          <div className="space-y-3 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
            <label className="font-medium text-gray-700">Product Images *</label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#be123c] transition cursor-pointer group bg-white">
              <input type="file" id="imageUpload" multiple onChange={handleImageUpload} className="hidden" accept="image/*" />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-[#be123c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">Click to upload new images</p>
                  <p className="text-xs text-gray-400">JPG, PNG, WEBP (Max 10MB)</p>
                </div>
              </label>
            </div>

            {(existingImages.length > 0 || previewUrls.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={`old-${index}`} className="relative group h-24">
                    <img src={url} alt="Saved" className="w-full h-full object-cover rounded border" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg">×</button>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[9px] text-white text-center rounded-b">Saved</span>
                  </div>
                ))}
                {/* New Previews */}
                {previewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative group h-24">
                    <img src={url} alt="New" className="w-full h-full object-cover rounded border border-[#be123c]" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg">×</button>
                    <span className="absolute bottom-0 left-0 right-0 bg-[#be123c] text-[9px] text-white text-center rounded-b">New</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={submitting} className={`flex-1 py-3 font-semibold rounded text-white ${submitting ? "bg-gray-400" : "bg-[#e11d48] hover:bg-[#be123c]"}`}>
              {submitting ? "Updating..." : "Update Product"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 rounded font-medium hover:bg-gray-50 flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}