import React from 'react';

const Title = ({title, subTitle}) => {
  return (
    <>
      <h1 className="text-3xl sm:text-5xl mb-4 text-[#091e2e] font-bold style">{title}</h1>
      <p className="max-w-2xl sm:text-lg text-[12px] leading-relaxed">
        {subTitle}
      </p>
    </>
  );
}

export default Title;
