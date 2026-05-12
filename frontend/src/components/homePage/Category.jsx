/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/* ------------------------------------
   MOST SELLING
------------------------------------ */
const mostSelling = [
  {
    name: "Chocolate Cake",
    image:
      "https://i.pinimg.com/736x/b4/84/95/b48495be28db56f015219bce5e043cbd.jpg",
  },
  {
    name: "Baked Cookie",
    image:
      "https://i.pinimg.com/1200x/35/a7/df/35a7df31d63c1522f84bc1ed1ad2b74f.jpg",
  },
  {
    name: "Strawberry Pastry",
    image:
      "https://i.pinimg.com/736x/01/44/94/014494156f6c67fd57b47865b26e6f40.jpg",
  },
  {
    name: "Cold Coffee",
    image:
      "https://i.pinimg.com/1200x/1c/3e/33/1c3e336092ab4163db42571058aeefde.jpg",
  },
  {
    name: "Croissant Bread",
    image:
      "https://i.pinimg.com/1200x/df/16/a2/df16a2dd37209244f709bdc15eca4656.jpg",
  },
  {
    name: "Cheese Pizza",
    image:
      "https://i.pinimg.com/1200x/68/d5/9f/68d59fa2d05a35a2ea0f4e47c39191d4.jpg",
  },
];

/* ------------------------------------
   CATEGORIES
------------------------------------ */
const categories = [
  {
    name: "Cakes",
    image:
      "https://i.pinimg.com/736x/fb/27/bc/fb27bc586c367fa23697850231e7d5ba.jpg",
  },
  {
    name: "Pizzas",
    image:
      "https://i.pinimg.com/736x/a6/34/c8/a634c8e44a0cc72bd6ae9b345678448a.jpg",
  },
  {
    name: "Pastries",
    image:
      "https://i.pinimg.com/736x/ed/8a/57/ed8a571f46cc8631eec0dc20a62aa40b.jpg",
  },
  {
    name: "Breads",
    image:
      "https://i.pinimg.com/736x/11/16/fc/1116fc34ce3a03bdd0eaac01a2c981e0.jpg",
  },
  {
    name: "Beverages",
    image:
      "https://i.pinimg.com/736x/e8/5f/74/e85f74d7ded0bb6a0539072d82de1b0f.jpg",
  },
  {
    name: "Cookies",
    image:
      "https://i.pinimg.com/1200x/d4/21/65/d4216552edd56870fa5b0889ec2e51d4.jpg",
  },
  {
    name: "Donuts",
    image:
      "https://i.pinimg.com/1200x/ce/61/f0/ce61f06047443a9ad3f1263bfd548357.jpg",
  },
  {
    name: "Customize Orders",
    image:
      "https://i.pinimg.com/736x/fc/d6/3b/fcd63b206337c0ae63ced801cc81b675.jpg",
  },
];

/* ANIMATION VARIANTS */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const zoomCard = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const Category = () => {
  const location = useLocation();

  // 🔥 Scroll to category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    if (category) {
      const id = category.replace(/\s+/g, "-");
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
      }
    }
  }, [location]);

  return (
    <section id="mostSellingItems" className="w-full pt-20 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Most Selling Title */}
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold text-center text-[#333333] mb-12"
        >
          India Loves: <span className="text-[#e11d48]">Bestsellers</span>
        </motion.h2>

        {/* Most Selling Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8 mb-20">
  {mostSelling.map((item) => {
    const getPath = () => {
      if (item.name.toLowerCase().includes("custom")) return "/customize";
      return "/menu";
    };

    return (
      <Link key={item.name} to={getPath()}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={zoomCard}
          className="cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05, translateY: -5 }}
            className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-300"
          >
            <div className="w-full h-44 sm:h-52 md:h-50 overflow-hidden p-2">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-2xl transform hover:scale-105 transition duration-500"
              />
            </div>

            <div className="w-full bg-[#e11d48] text-center py-3">
              <h3 className="text-white font-bold text-sm md:text-base">
                {item.name}
              </h3>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    );
  })}
</div>

        {/* Categories Title */}
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold text-center text-[#333333] mb-12"
        >
          Menu: <span className="text-[#e11d48]">What will you wish for?</span>
        </motion.h2>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {categories.map((cat) => {
            const id = cat.name.replace(/\s+/g, "-");

           return (
  <Link
  key={cat.name}
  to={
    cat.name === "Customize Orders"
      ? "/customize"
      : `/menu?category=${encodeURIComponent(cat.name)}`
  }
>
    <motion.div
      id={id} // 🔥 IMPORTANT: target for scroll
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={zoomCard}
      className="cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.05, translateY: -5 }}
        className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-300"
      >
        <div className="w-full h-44 sm:h-52 md:h-56 overflow-hidden">
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-500 pb-12"
          />
        </div>

        <div className="absolute bottom-0 w-full bg-[#e11d48]/90 backdrop-blur-sm text-center py-3">
          <h3 className="text-white font-bold text-lg md:text-xl">
            {cat.name}
          </h3>
        </div>
      </motion.div>
    </motion.div>
  </Link>
);
          })}
        </div>
      </div>
    </section>
  );
};

export default Category;