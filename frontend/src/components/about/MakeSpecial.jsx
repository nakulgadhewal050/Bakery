import React from 'react'

const MakeSpecial = () => {
  return (
    <div className="relative w-full h-[60vh] overflow-hidden lg:mt-10">
        <img
          src="https://img.freepik.com/free-photo/top-view-sugar-cookies-with-orange-slices-dark-surface-cookies-biscuit-sweet-tea-cake_140725-118305.jpg"
          className="w-full h-full object-cover object-center"
        />

         {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/20"></div>

        {/* left text */}
        <div className="absolute inset-0 flex flex-col items-start justify-center text-start text-white">
            <div className='px-[2vh] text-start sm:px-[10vh]'>
                <h1 className="text-3xl sm:text-6xl font-bold mb-2 sm:mb-4 text-[#091e2e] style">Freshly Baked Bread <br /> Every Morning</h1>
                <p className="max-w-2xl sm:text-lg text-[12px] leading-relaxed">
                  Every morning, our bakers wake up early to prepare fresh, warm bread for you. With care and quality ingredients, each loaf is crafted to perfection. Start your day with the irresistible aroma and taste of bread made with love.
                </p>
            </div>
        </div>

        <div className="yellow-circle absolute -left-15 top-0 blur-xl"></div>
    </div>
  )
}

export default MakeSpecial