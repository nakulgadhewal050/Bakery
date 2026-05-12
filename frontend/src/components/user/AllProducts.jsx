import React, { useState, useEffect } from "react";
import api from "../../api/axios";
// import { useCallback } from "react";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(
          "/api/product/products",
          {
            params: filters,
          }
        );

        setProducts(res.data.products);
        setTotalPages(res.data.pages);
      } catch (error) {
        console.error("Fetch products failed:", error);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      page: 1, // reset to page 1 whenever filters change
      [name]: value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-10">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <input
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search Products"
          className="p-3 border rounded"
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="p-3 border rounded"
        >
          <option value="">All Categories</option>
          <option value="cakes">Cakes</option>
          <option value="pastries">Pastries</option>
          <option value="cookies">Cookies</option>
        </select>

        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
          className="p-3 border rounded"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <input
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="Min Price"
          className="p-3 border rounded"
        />

        <input
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="Max Price"
          className="p-3 border rounded"
        />
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p._id} className="p-4 border rounded shadow-sm">
            <h3 className="font-bold text-lg">{p.name}</h3>
            <p className="text-gray-600">{p.category}</p>
            <p className="text-xl font-semibold">₹{p.price}</p>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="mt-8 flex justify-center gap-3">
        <button
          disabled={filters.page === 1}
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>

        <span className="px-4 py-2 bg-gray-100 rounded">
          Page {filters.page} of {totalPages}
        </span>

        <button
          disabled={filters.page === totalPages}
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
