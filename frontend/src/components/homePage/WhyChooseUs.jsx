/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Cake, Heart, ThumbsUp, Timer } from "lucide-react";

const WhyChooseUs = () => {
    const features = [
        {
            title: "Freshly Baked Everyday",
            desc: "We bake everything daily using premium ingredients for the best taste.",
            icon: <Cake size={36} className="text-[#e11d48]" />,
        },
        {
            title: "Loved by Customers",
            desc: "Our customers trust us for quality, taste, and consistency.",
            icon: <Heart size={36} className="text-[#e11d48]" />,
        },
        {
            title: "Top Quality Ingredients",
            desc: "Only the finest chocolates, creams, and dairy products are used.",
            icon: <ThumbsUp size={36} className="text-[#e11d48]" />,
        },
        {
            title: "On-Time Delivery",
            desc: "We deliver your cakes fresh and right on time for your celebrations.",
            icon: <Timer size={36} className="text-[#e11d48]" />,
        },
    ];

    return (
        <section className="w-full py-10 px-4 md:px-8 flex justify-center bg-transparent">
            {/* Pill-shaped container matching the reference image */}
            <div className="relative max-w-6xl w-full bg-[#FFCCD5] rounded-[2.5rem] md:rounded-[4rem] py-12 px-6 md:px-12 flex flex-col items-center shadow-sm overflow-hidden">
                
                {/* Decorative elements kept and adapted to fit inside the new pill container */}
                <motion.div
                    className="absolute w-64 h-64 bg-red-200/50 rounded-full blur-3xl z-0 -top-20 -left-20"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-64 h-64 bg-pink-300/40 rounded-full blur-3xl z-0 -bottom-20 -right-20"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-bold text-center text-[#333333] mb-10 relative z-10"
                >
                    Why <span className="text-[#e11d48]">Choose Us?</span>
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full text-center relative z-10">
                    {features.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.2,
                            }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center space-y-3 px-2 group"
                        >
                            <div className="p-4 bg-white/40 backdrop-blur-sm rounded-full group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-[#333333]">
                                {item.title}
                            </h3>
                            <p className="text-sm text-[#555555] leading-relaxed max-w-[200px]">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;