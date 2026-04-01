import React from "react";
import cookie from "../../assets/homePage/cookie.png";
import { Link } from "react-router-dom";

const DeliverySection = () => {
    return (
        <section className="relative w-full py-20 bg-white overflow-hidden">

            {/* Background Cookie Image */}
            <img
                src={cookie}
                alt="cookie"
                className="absolute bottom-0 left-0 w-[160px] opacity-20 pointer-events-none select-none 
                md:w-[250px] lg:w-[320px]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-12 relative z-10">

                {/* Text Section (Left) */}
                <div className="flex-1 relative">

                    {/* Large faded background text - Switched to subtle Rose Red */}
                    <h1 className="absolute -top-10 left-0 text-[100px] md:text-[150px] font-extrabold text-[#e11d48]/5 leading-none tracking-wider select-none pointer-events-none">
                        FAST
                    </h1>

                    <h2 className="text-4xl md:text-5xl font-bold text-[#333333] leading-snug relative">
                        Fast & Fresh Delivery,
                        <br />
                        <span className="text-[#e11d48]">right to your doorstep</span>
                    </h2>

                    <p className="mt-5 text-gray-600 text-lg leading-relaxed font-medium">
                        Enjoy bakery-fresh cakes, pastries, cupcakes, and more delivered straight to your home.
                        Our delivery partners ensure every order arrives on time, fresh, and handled with care.
                        Taste happiness without stepping out!
                    </p>

                    {/* Learn More - Switched to Premium Red Pill Button */}
                    <Link to="/about">
                        <button className="px-8 py-3 rounded-full bg-[#e11d48] text-white font-bold shadow-lg shadow-red-100 hover:bg-[#be123c] hover:scale-105 transition-all cursor-pointer mt-6 flex items-center gap-2">
                            Learn More <span className="text-xl">→</span>
                        </button>
                    </Link>
                </div>

                {/* Image Section (Right) */}
                <div className="flex-1">
                    {/* Changed frame from purple to Red glass effect */}
                    <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#e11d48]/10 backdrop-blur-md p-2 border border-[#e11d48]/20">
                        <img
                            src="https://i.pinimg.com/736x/97/a9/8f/97a98f8f856e20ed0a23e807133dafa6.jpg"
                            alt="Delivery"
                            className="rounded-[2rem] object-cover w-full h-[380px]"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default DeliverySection;