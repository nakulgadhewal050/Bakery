import React from 'react'
import { images } from '../../assets/assets'
import ImageCard from './ImageCard'

const ImageGallery = () => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 imageGallery">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          <ImageCard src={images[0].src} label={images[0].label} />
          <ImageCard src={images[1].src} label={images[1].label} />
        </div>

        {/* MIDDLE COLUMN (Full Height Image) */}
        <div>
          <ImageCard
            src={images[2].src}
            label={images[2].label}
            className="h-full"
            tall
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          <ImageCard src={images[3].src} label={images[3].label} />
          <ImageCard src={images[4].src} label={images[4].label} />
        </div>

      </div>
    </>
  )
}

export default ImageGallery