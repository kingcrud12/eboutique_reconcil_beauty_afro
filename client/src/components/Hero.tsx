import React, { useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    image: "ban_2.png",
    mobileImage: "ban_2_mobile.png",
    title: "L'Élégance Naturelle",
    subtitle: "Penser pour aimer et révéler la beauté de vos cheveux au quotidien",
    cta: "Voir",
    link: "/products",
  },
  {
    image: "bannerAlph.png",
    mobileImage: "bannerAlph_mobile.png",
    title: "Duo Éclat & Douceur",
    subtitle: "Un duo naturel qui respecte la vraie nature de vos cheveux",
    cta: "Découvrir le Duo",
    link: "/products",
  },
  {
    image: "cinematic_hero.png",
    mobileImage: "cinematic_hero_mobile.png",
    title: "L'Essence de la Nature",
    subtitle: "Plongez dans un univers où la beauté rencontre l'authenticité.",
    cta: "Explorer la Collection",
    link: "/products",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    arrows: false,
    beforeChange: (_: number, newIndex: number) => setCurrentSlide(newIndex),
    appendDots: (dots: React.ReactNode) => (
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 40,
        }}
      >
        <ul className="flex gap-2 m-0 p-0"> {dots} </ul>
      </div>
    ),
    customPaging: (i: number) => (
      <div
        className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 backdrop-blur-sm ${i === currentSlide
          ? "bg-white scale-125"
          : "bg-transparent opacity-40 hover:opacity-100"
          }`}
      ></div>
    ),
  };

  return (
    <div className="w-full relative overflow-hidden bg-neutral-900 z-0">
      <Slider {...settings} className="w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative w-full h-[65vh] md:h-[80vh] lg:h-screen outline-none group overflow-hidden"
          >
            <Link to={slide.link} className="block w-full h-full relative cursor-pointer">
              <picture className="w-full h-full block relative">
                <source
                  media="(max-width: 768px)"
                  srcSet={slide.mobileImage || slide.image}
                />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover object-center transform transition-transform ease-out will-change-transform filter brightness-105 ${index === currentSlide ? "scale-105 duration-[10000ms]" : "scale-100 duration-[10000ms]"
                    }`}
                />
              </picture>

              {/* Text Overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 py-8 sm:px-6 sm:py-12 md:px-12">
                <div className="max-w-4xl space-y-4 md:space-y-6 animate-fade-in-up">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-playfair text-white drop-shadow-lg font-bold leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-open-sans text-white/95 drop-shadow-md font-medium max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                    {slide.subtitle}
                  </p>
                  <div className="pt-4 sm:pt-6">
                    <span className="inline-block px-6 py-2 sm:px-8 sm:py-3 bg-purple-900 text-white font-semibold rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300 transform hover:scale-105 shadow-lg border border-transparent hover:border-purple-900 text-sm md:text-base">
                      {slide.cta}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Hero;
