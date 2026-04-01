/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const cakes = [
    {
        name: "Party Chocolate Cake",
        img: "https://i.pinimg.com/1200x/8e/00/d3/8e00d3dcba05753cec89bd5120cd18be.jpg",
    },
    {
        name: "Valentine's Day Special Cake",
        img: "https://i.pinimg.com/736x/f5/e1/0e/f5e10efa13c6d921d23f064af75f1886.jpg",
    },
    {
        name: "Castle Theme Cake",
        img: "https://i.pinimg.com/736x/17/13/56/1713561bb30593265188620cdf092de8.jpg",
    },
    {
        name: "Unicorn Theme Cake",
        img: "https://i.pinimg.com/736x/5b/c2/7a/5bc27a7bd4d1435fb3a18bf26d824e1e.jpg",
    },
];

const CakeCustomize = () => {
    return (
        <section className="w-full bg-white py-20 px-4 sm:px-8 lg:px-20">
            <div className="max-w-7xl mx-auto text-center">

                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a1a]"
                >
                    Customize Your <span className="text-[#e11d48]">Perfect Cake</span>
                </motion.h2>

                <p className="text-gray-600 text-base sm:text-lg mt-4 max-w-2xl mx-auto">
                    Choose your design, flavor, and size to create your dream celebration cake.
                </p>

                {/* Cake Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
                    {cakes.map((cake, index) => (
                        <motion.div
                            key={cake.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="h-64 sm:h-72 overflow-hidden">
                                <img
                                    src={cake.img}
                                    alt={cake.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#1a1a1a] group-hover:text-[#e11d48] transition-colors">
                                    {cake.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold">
                                    Full Customization
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <Link to="/customize">
                        <button className="mt-12 px-10 py-4 rounded-full bg-[#e11d48] text-white text-lg font-bold shadow-lg shadow-red-100 hover:bg-[#be123c] hover:scale-105 transition-all duration-300">
                            Customize Now →
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CakeCustomize;