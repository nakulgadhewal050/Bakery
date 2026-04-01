/* eslint-disable no-unused-vars */
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Testimonial = () => {
    const testimonials = [
        {
            name: "Aarav Sharma",
            message:
                "The cakes are unbelievably soft and fresh! Delivery was on time and the packaging was perfect.",
            image:
                "https://i.pinimg.com/1200x/e8/09/8a/e8098a3d487b4fd7b8d591d7d9db32bb.jpg",
        },
        {
            name: "Priya Mehta",
            message:
                "Best bakery in town! Their cupcakes melt in your mouth. The staff is super friendly and helpful.",
            image:
                "https://i.pinimg.com/1200x/1c/85/2e/1c852ea928150dfcf54c5457dbca0a35.jpg",
        },
        {
            name: "Rohan Verma",
            message:
                "Ordered a birthday cake and everyone loved it! Beautiful design and great taste. Will order again!",
            image:
                "https://i.pinimg.com/736x/fc/af/7a/fcaf7aec4b7be05a0d062eff7851d2aa.jpg",
        },
    ];

    return (
        <section className="w-full pt-32 pb-20 bg-[#fff0f3] relative overflow-hidden">

            {/* Background Watermark - Faded Rose Red */}
            <h1
                className="
                absolute 
                top-40 left-1/2 
                -translate-x-1/2 -translate-y-[70%]
                text-[90px] sm:text-[120px] md:text-[160px] lg:text-[200px] 
                font-extrabold 
                text-[#e11d48]/5 
                tracking-wider 
                select-none pointer-events-none 
                whitespace-nowrap
                z-0
            "
            >
                CLIENTS
            </h1>

            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">

                {/* Heading - Charcoal & Rose Red */}
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-16 text-center relative">
                    Our <span className="text-[#e11d48]">Happy Clients</span>
                </h2>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    autoplay={{ delay: 3500 }}
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    className="pb-16 px-4"
                >
                    {testimonials.map((t, index) => (
                        <SwiperSlide key={index} className="py-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10 }}
                                transition={{ duration: 0.4 }}
                                /* Card styling: White card on Pink bg with ambient shadow */
                                className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-none text-center"
                            >
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative mb-4">
                                        <img
                                            src={t.image}
                                            alt={t.name}
                                            className="w-20 h-20 rounded-full object-cover shadow-md ring-4 ring-white"
                                        />
                                        <div className="absolute -bottom-1 right-0 bg-[#e11d48] p-1.5 rounded-full border-4 border-white shadow-sm">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12M14.017 21H11.017V12M4.017 21L4.017 18C4.017 16.8954 4.91243 16 6.017 16H9.017C9.56928 16 10.017 15.5523 10.017 15V9C10.017 8.44772 9.56928 8 9.017 8H5.017C4.46472 8 4.017 8.44772 4.017 9V12M4.017 21H1.017V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1a1a1a]">
                                        {t.name}
                                    </h3>
                                </div>

                                <p className="text-gray-500 italic leading-relaxed mb-6 text-lg">
                                    “{t.message}”
                                </p>

                                <div className="flex gap-1 justify-center">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} className="text-yellow-400 text-xl">★</span>
                                    ))}
                                </div>
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default Testimonial;