import React from "react";
import piping from "../../assets/homePage/CreamPiping.png";
import { Link } from "react-router-dom";

const ChefSection = () => {
    return (
        <section className="relative w-full py-20 bg-white overflow-hidden">

            {/* Background Piping Image */}
            <img
                src={piping}
                alt="piping"
                className="absolute bottom-0 right-0 w-[360px] opacity-20 pointer-events-none select-none 
                md:w-[520px] lg:w-[560px]"
            />

            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">

                {/* Image Section */}
                <div className="flex-1">
                    {/* Changed frame from purple to Red glass effect */}
                    <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-[#e11d48]/10 backdrop-blur-md p-2 border border-[#e11d48]/20">
                        <img
                            src="https://i.pinimg.com/1200x/a0/18/7d/a0187d62c5d98d0d8e2be12450cee268.jpg"
                            alt="Chef"
                            className="rounded-[2rem] object-cover w-full h-[340px]"
                        />
                    </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 relative">

                    {/* Large faded text behind - Switched to Rose Red tint */}
                    <h1 className="absolute -top-10 left-0 text-[150px] font-extrabold text-[#e11d48]/5 leading-none tracking-wider select-none pointer-events-none">
                        CHEF
                    </h1>

                    {/* Changed color to Dark Charcoal and Rose Red */}
                    <h2 className="text-4xl md:text-5xl font-bold text-[#333333] leading-snug relative">
                        Oven-fresh baked goods,
                        <br /> <span className="text-[#e11d48]">baked just for you</span>
                    </h2>

                    <p className="mt-5 text-[#555555] text-lg leading-relaxed font-medium">
                        We bake delicious treats with the finest ingredients. From warm chocolate chip cookies
                        to flaky croissants, every bite is filled with love, warmth, and flavor. Come experience
                        the magic of our bakery.
                    </p>

                    <Link to="/about">
                        {/* Changed text and arrow color to Rose Red */}
                        <button className="mt-6 text-[#e11d48] font-bold text-lg flex items-center gap-2 hover:gap-4 transition-all duration-300 cursor-pointer">
                            Read More <span className="text-xl">→</span>
                        </button>
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default ChefSection;