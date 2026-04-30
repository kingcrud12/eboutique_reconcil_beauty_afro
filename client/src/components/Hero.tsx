import React, { useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "bannerAlph_square.png",
    tag: "Nouveauté",
    title: "Duo Éclat & Douceur",
    titleGreen: "Hydratation Intense & Brillance",
    subtitle: "Un duo naturel qui respecte la vraie nature de vos cheveux",
    cta: "Découvrir la gamme",
    link: "/products",
  },
  {
    image: "ban_1_square.png",
    tag: "Best-seller",
    title: "Nos Huiles Naturelles",
    titleGreen: "100% bio & artisanales",
    subtitle: "Ricin, argan, coco — des soins ancestraux pour nourrir et sublimer vos cheveux",
    cta: "Voir la collection",
    link: "/products",
  },
  {
    image: "banner_carthame_desktop.png",
    tag: "Sélection",
    title: "L'Élégance Naturelle",
    titleGreen: "Directement de la nature",
    subtitle: "Penser pour aimer et révéler la beauté de vos cheveux au quotidien",
    cta: "Explorer",
    link: "/products",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goTo = (index: number) => setCurrentSlide(index);
  const goNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  // Auto-advance
  React.useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="w-full bg-sage-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left — Text */}
          <div className="flex-1 space-y-5 text-center md:text-left">
            <span className="inline-block bg-sage-100 text-sage-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {slide.tag}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-800 leading-tight">
              {slide.title}
              <br />
              <span className="text-sage-600">{slide.titleGreen}</span>
            </h1>

            <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed">
              {slide.subtitle}
            </p>

            <div className="pt-2">
              <Link
                to={slide.link}
                className="inline-block px-7 py-3 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors duration-200 text-sm sm:text-base"
              >
                {slide.cta}
              </Link>
            </div>

            {/* Dots */}
            <div className="flex gap-2 pt-4 justify-center md:justify-start">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === currentSlide
                    ? "w-8 h-2 bg-sage-600"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right — Product Image */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md md:max-w-lg aspect-square rounded-2xl overflow-hidden bg-sage-50">
              <img
                src={`/${slide.image}`}
                alt={slide.title}
                className="w-full h-full object-cover transition-opacity duration-500"
                key={currentSlide}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
