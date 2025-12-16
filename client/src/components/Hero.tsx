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
    subtitle: "L'alliance parfaite du beure de mangue et de la carthame.",
    cta: "Voir",
    link: "/products",
  },
  {
    image: "bannerAlph.png",
    mobileImage: "bannerAlph_mobile.png",
    title: "Duo Éclat & Douceur",
    subtitle: "La magie de la Mangue et du Carthame pour vos cheveux.",
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
    isCinematic: true, // Marker for full-screen mode
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1500, // Slower transition for elegance
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000, // Longer for cinematic slide
    fade: true,
    arrows: false,
    beforeChange: (_: number, newIndex: number) => setCurrentSlide(newIndex),
    appendDots: (dots: React.ReactNode) => (
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 70, // Ensure dots are above the full-screen slide
        }}
      >
        <ul className="flex gap-2"> {dots} </ul>
      </div>
    ),
    customPaging: (i: number) => (
      <div
        className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 backdrop-blur-sm ${i === currentSlide ? "bg-white scale-125" : "bg-transparent opacity-40 hover:opacity-100"
          }`}
      ></div>
    ),
  };

  // Check if current slide is cinematic (needs to cover Appbar)
  const isCinematicMode = slides[currentSlide].isCinematic;

  return (
    // If cinematic, use z-[60] to cover the fixed z-50 Appbar. Also enforce h-screen.
    <div className={`w-full relative overflow-hidden bg-white transition-all duration-500
      ${isCinematicMode ? "z-[60] h-screen fixed inset-0" : "relative h-[45vh] md:h-screen z-0"}
    `}>
      <Slider {...settings} className="h-full">
        {slides.map((slide, index) => (
          <div key={index} className="relative w-full h-full outline-none group overflow-hidden">
            <Link to={slide.link} className="block w-full h-full relative">
              <div className="w-full h-full overflow-hidden relative">
                <picture className="w-full h-full block">
                  <source media="(max-width: 768px)" srcSet={slide.mobileImage || slide.image} />
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={`w-full h-full object-cover object-top transform transition-transform ease-in-out will-change-transform 
                      ${slide.isCinematic ? "animate-ken-burns" : (index === currentSlide ? "scale-110 duration-[10000ms]" : "scale-100 duration-[10000ms]")} 
                      filter brightness-105`}
                  />
                </picture>

                {/* Text Overlay */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-4 
                  ${slide.isCinematic ? "bg-black/40 justify-end pb-32" : "bg-black/40"}`}>

                  <div className="max-w-4xl space-y-4 animate-fade-in-up">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-playfair text-white drop-shadow-lg font-bold">
                      {slide.title}
                    </h2>
                    <p className="text-xl md:text-2xl font-open-sans text-white/95 drop-shadow-md font-medium max-w-2xl mx-auto">
                      {slide.subtitle}
                    </p>
                    <span className="inline-block mt-6 px-8 py-3 bg-purple-900 text-white font-semibold rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300 transform hover:scale-105 shadow-lg border border-transparent hover:border-purple-900">
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
