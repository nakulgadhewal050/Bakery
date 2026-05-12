import React from 'react'

const ImageCard = ({ src, label, tall }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl group imageCard 
      ${tall ? "h-[600px]" : "h-[290px]"}`}
    >

      {/* Image */}
      <img
        src={src}
        alt={label}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />

      {/* Bottom → Top Black Gradient Overlay */}
      <div
        className="
          absolute inset-0 
          bg-gradient-to-t 
          from-black/100 
          via-black/10 
          to-transparent
          opacity-0 
          group-hover:opacity-100 
          transition-all 
          duration-500
        "
      ></div>

      {/* Text Slide Up From Bottom */}
      <div
        className="
          absolute bottom-0 left-0 w-full 
          text-white text-sm py-3 px-4 text-center font-medium
          translate-y-full 
          group-hover:translate-y-0 
          transition-all duration-500
          labelText
        "
      >
        {label}
      </div>

    </div>
  )
}

export default ImageCard