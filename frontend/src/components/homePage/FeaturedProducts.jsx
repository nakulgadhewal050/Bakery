/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCart } from "../redux/Slice";

const API_BASE = "/api/featured";

/* ================= Animations ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const containerStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25 },
  },
};

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector(selectCart);

  const handleOrderNow = (product) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("authToken");

    if (!token) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/order" } });
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    const alreadyInCart = items.find((item) => item.id === product._id);

    if (!alreadyInCart) {
      dispatch(
        addToCart({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]
            ? product.images[0].startsWith("http")
              ? product.images[0]
              : `${product.images[0]}`
            : "",
          qty: 1,
        })
      );
    }

    navigate("/order");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(API_BASE);

        if (res.data?.success && Array.isArray(res.data.products)) {
          const featured = res.data.products
            .filter((p) => p.isFeatured === true)
            .slice(0, 4);

          setFeaturedProducts(featured);
        }
      } catch (err) {
        console.error("Failed to load featured products", err);
      }
    };

    fetchProducts();
  }, []);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-3xl sm:text-5xl font-bold text-center text-[#1a1a1a] mb-16"
      >
        Our <span className="text-[#e11d48]">Featured Treats</span>
      </motion.h2>

      <motion.div
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
      >
        {featuredProducts.map((item) => (
          <motion.div
            key={item._id}
            variants={fadeUp}
            whileHover={{ scale: 1.04, y: -8 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* IMAGE */}
            <div className="overflow-hidden">
              <img
                src={
                  item.images?.[0]
                    ? item.images[0].startsWith("http")
                      ? item.images[0]
                      : `${item.images[0]}`
                    : "https://via.placeholder.com/400x400?text=No+Image"
                }
                alt={item.name}
                className="w-full h-56 object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* CONTENT */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-[#1a1a1a]">{item.name}</h3>

              <p className="text-sm font-semibold text-[#e11d48] uppercase tracking-wider mt-1">
                {item.category}
              </p>

              <p className="mt-3 text-gray-500 text-sm line-clamp-3 flex-grow">
                {item.description}
              </p>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-xl font-bold text-[#1a1a1a]">
                  ₹{item.price}
                </span>

                <button
                  onClick={() => handleOrderNow(item)}
                  className="px-6 py-2 rounded-full bg-[#e11d48] text-white font-bold hover:bg-[#be123c] shadow-md shadow-red-100 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-14 flex justify-center">
        <Link to="/menu">
          <button className="px-8 py-3 rounded-full border-2 border-[#e11d48] text-[#e11d48] font-bold hover:bg-[#fff0f3] transition-colors shadow-sm">
            View Full Menu
          </button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;