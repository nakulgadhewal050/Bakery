/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import cake from "../../assets/homePage/HeroCake3.png";
import { motion } from "framer-motion";
import Category from "./Category";
import ChefSection from "./ChefSection";
import DeliverySection from "./DeliverySection";
import Testimonial from "./Testimonials";
import WhyChooseUs from "./WhyChooseUs";
import FeaturedProducts from "./FeaturedProducts";
import { Link } from "react-router-dom";
import CakeCustomize from "./CakeCustomize";
import WhatsappButton from "./WhatsappButton";

const Homepage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="bg-[#fff0f3]">
      {/* ================= HERO SECTION ================= */}

      {/* 📱 MOBILE VIEW */}
      {isMobile && (
        <section className="w-full pt-24 pb-16 min-h-[80vh]">
          <div className="px-4 text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold text-[#333333] leading-tight"
            >
              Bringing You Happiness <br />
              Through a Piece of Cake, <br />
              <span className="text-[#e11d48]">Delivered Daily!</span>
            </motion.h1>

            <motion.img
              src={cake}
              alt="Cake"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto w-full max-w-xs drop-shadow-2xl"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base text-[#555555]"
            >
              Explore our delicious cupcakes, pastries, cakes & custom bakery
              treats made fresh with love every single day.
            </motion.p>

            <div className="flex justify-center gap-4">
              <Link to="/order">
                <button className="px-8 py-2.5 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-semibold shadow-md transition-colors">
                  Order
                </button>
              </Link>
              <Link to="/menu">
                <button className="px-8 py-2.5 rounded-full bg-white border border-[#e11d48] text-[#e11d48] font-semibold shadow-sm hover:bg-[#fff0f3] transition-colors">
                  Explore Menu
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 💻 DESKTOP VIEW */}
      {!isMobile && (
        <section className="w-full pt-24 md:pt-32 pb-24 min-h-[80vh] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-row items-center justify-between gap-10">
            <div className="flex-1 font-serif text-left">
              <motion.h1
                initial={{ opacity: 0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-5xl lg:text-6xl font-extrabold text-[#333333]"
              >
                Bringing You Happiness <br />
                Through a Piece of Cake, <br />
                <span className="text-[#e11d48]">Delivered Daily!</span>
              </motion.h1>

              <p className="mt-4 text-xl text-[#555555] max-w-xl font-sans">
                Explore our delicious cupcakes, pastries, cakes & custom bakery
                treats made fresh with love every single day.
              </p>

              <div className="mt-8 flex gap-4 font-sans">
                <Link to="/order">
                  <button className="px-10 py-3 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-bold shadow-lg transition-all transform hover:scale-105">
                    Order Now
                  </button>
                </Link>
                <Link to="/menu">
                  <button className="px-10 py-3 rounded-full bg-white border-2 border-[#e11d48] text-[#e11d48] font-bold shadow-md hover:bg-[#fff0f3] transition-all transform hover:scale-105">
                    Explore Menu
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <motion.img
                src={cake}
                alt="Cake"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-full max-w-lg drop-shadow-2xl"
              />
            </div>
          </div>
        </section>
      )}

      {/* ================= OTHER SECTIONS (WHITE OVERLAP WRAPPER) ================= */}
      <div className="bg-white w-full relative z-10 rounded-t-[2.5rem] md:rounded-t-[4rem] pt-12 pb-16 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] -mt-6">
        <WhatsappButton />
        <WhyChooseUs />
        <Category />
        <ChefSection />
        <FeaturedProducts />
        <DeliverySection />
        <Testimonial />
        <CakeCustomize />
      </div>
    </div>
  );
};

export default Homepage;