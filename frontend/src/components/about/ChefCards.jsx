import React, { useState, useEffect } from "react";
import { card } from "../../assets/assets";
import Title from "./Title";

const ChefCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  // Auto slide infinite
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);

      setTimeout(() => {
        setCurrentIndex((prev) =>
          prev === card.length - 1 ? 0 : prev + 1
        );
        setAnimate(false);
      }, 300); // match animation timing
    }, 3000); // slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentCard = card[currentIndex];

  return (
    <div className="flex flex-col lg:flex-row md:m-10 lg:m-0 items-center justify-center gap-5 relative">

      {/* Image */}
      <img
        src={currentCard.image}
        alt="Card image"
        className={`max-w-lg rounded-xl w-[90%] sm:w-full object-cover transition-all duration-300 ease-in-out 
        ${animate ? "opacity-0 translate-x-5" : "opacity-100 translate-x-0"}`}
      />

      {/* Right Card Info */}
      <div
        className={`px-5 rounded-xl py-10 transition-all duration-300 ease-in-out 
        ${animate ? "opacity-0 translate-x-5" : "opacity-100 translate-x-0"}`}
      >
        <div className="text-center sm:text-start">
          <Title title={currentCard.title} subTitle={currentCard.description} />
        </div>

        <div className="flex flex-col gap-5 mt-6">
          <h2 className="text-xl font-extrabold text-[#091e2e]">
            {currentCard.heading}
          </h2>

          {currentCard.timings.map((timing, index) => (
            <div
              key={index}
              className="flex justify-between text-sm sm:text-lg"
            >
              <span>{timing.day}</span>
              <span className="text-[#604a4c]">{timing.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ChefCards;
