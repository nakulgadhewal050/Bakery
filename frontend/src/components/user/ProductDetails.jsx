import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/product/${id}`);

        setProduct(res.data.product);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center text-xl font-semibold">
        Loading Product...
      </div>
    );

  if (!product)
    return (
      <div className="h-[60vh] flex items-center justify-center text-xl text-red-600">
        Product not found.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT — PRODUCT IMAGE */}
        <div className="flex justify-center items-center bg-white rounded-xl shadow-md p-6">
          <img
            src={
              product.images?.[0] ||
              "https://via.placeholder.com/400x400.png?text=No+Image"
            }
            alt={product.name}
            className="rounded-xl w-full h-auto object-cover shadow"
          />
        </div>

        {/* RIGHT — PRODUCT INFO */}
        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-extrabold text-[#6f482a]">
            {product.name}
          </h1>

          <p className="text-2xl font-semibold text-[#d78f52]">
            ₹{product.price}
          </p>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div>
            <p className="font-semibold text-gray-700">
              Category:{" "}
              <span className="text-[#c57b41]">{product.category}</span>
            </p>
          </div>

          {/* TAGS */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#f4e3d6] text-[#8b5e3c] text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ADD TO CART */}
          <button
            className="mt-6 flex items-center gap-2 bg-[#dda56a] hover:bg-[#c98f5a]
            text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition"
          >
            <FaCartPlus size={20} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
