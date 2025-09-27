import React from "react";

function Hero() {
  return (
    <div className="w-full relative">
      {/* Image de fond */}
      <img
        src="/Black_hair.gif"
        alt="hero_picture"
        className="w-full h-[300px] sm:h-[400px] md:h-[600px] lg:h-[760px] object-cover"
      />

      {/* Texte centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white text-center drop-shadow-lg px-4 lg:mt-[100px]">
          Révélez la beauté de vos cheveux
        </h1>
      </div>
    </div>
  );
}

export default Hero;
