import React from 'react'
import Title from './Title'
import bread from '../../assets/about/bread.png'
import { benefitBreadPoints } from '../../assets/assets'

const BenefitBread = () => {
  return (
    <div className="items-center flex flex-col text-center">
      <Title title="Benefits of Bread" subTitle="Freshly baked bread delivers natural energy and essential nutrients. A wholesome daily choice for a healthier lifestyle."/>

      <div className='grid grid-cols-3 gap-2 mt-15 benefitBread'>
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-7">
          <div className='p-5 rounded-lg bg-[white] text-start'>
            <h3 className="text-xl font-semibold mb-2 style">{benefitBreadPoints[0].title}</h3>
            <p>{benefitBreadPoints[0].description}</p>
          </div>
          <div className='p-5 rounded-lg bg-[white] text-start'>
            <h3 className="text-xl font-semibold mb-2 style">{benefitBreadPoints[1].title}</h3>
            <p>{benefitBreadPoints[1].description}</p>
          </div>
          <div className='p-5 rounded-lg bg-[white] text-start'>
            <h3 className="text-xl font-semibold mb-2 style">{benefitBreadPoints[2].title}</h3>
            <p>{benefitBreadPoints[2].description}</p>
          </div>
        </div>

        {/* MIDDLE COLUMN (Full Height Image) */}
        <div className='flex justify-center'>
          <img
            src={bread}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-7">
          <div className='p-5 rounded-lg bg-[white]  text-start'>
            <h3 className="text-xl font-semibold mb-2 style">{benefitBreadPoints[3].title}</h3>
            <p>{benefitBreadPoints[3].description}</p>
          </div>
          <div className='p-5 rounded-lg bg-[white]  text-start'>
            <h3 className="text-xl font-semibold mb-2 style">{benefitBreadPoints[4].title}</h3>
            <p>{benefitBreadPoints[4].description}</p>
          </div>
          <div className='p-5 rounded-lg bg-[white] text-start'>
            <h3 className="text-xl font-semibold mb-2 style">{benefitBreadPoints[5].title}</h3>
            <p>{benefitBreadPoints[5].description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BenefitBread
