import React from 'react';
import ChefCards from './ChefCards';
import ImageGallery from './ImageGallery';
import MakeSpecial from './MakeSpecial';
import BenefitBread from './BenefitBread';

const About = () => {
  return (
    <div className='bg-[#fff0f3]'>
      <div className="relative w-full h-[65vh] overflow-hidden">
        <img
          src="https://img.freepik.com/premium-photo/sign-that-says-breads-it_1304147-112710.jpg"
          className="w-full h-full object-cover object-center"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/20"></div>

        {/* Centered text */}
        <div className=" pt-20 absolute inset-0 flex flex-col items-center justify-center text-center text-white px-5">
          <h1 className="text-5xl sm:text-8xl font-bold mb-4 text-[#091e2e] style">About Us</h1>
          <p className="max-w-2xl sm:text-xl text-[12px] leading-relaxed font-bold">
           At Graphura, we’re not just about baking; we’re about crafting moments of pure joy and indulgence. Our mission has been to delight the people of Indore with exceptional baked goods made with passion and creativity.
          </p>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-8 px-4 md:px-0 py-10 lg:mt-10 max-w-5xl mx-auto">
        <ChefCards />
      </div>

      <MakeSpecial />

      <div className="max-w-7xl mx-auto py-10 px-4 lg:mt-10">
        <ImageGallery />
      </div>

      <div className="max-w-7xl mx-auto py-10 px-4 lg:mt-10">
        <BenefitBread />
      </div>

    
    </div>
  );
}

export default About;
