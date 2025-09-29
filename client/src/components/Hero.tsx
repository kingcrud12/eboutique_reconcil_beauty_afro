import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const settings = {
    dots: true,
    infinite: true,
    speed: 100,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const images = [
    "/Black_hair2.jpg", // première image stylisée
    "/banner_5.png",
    "/banner_1.png",
  ];

  // Calcul de la marge verticale après le Hero
  let heroMarginBottom = "mt-[50px]"; // default
  if (!isMobile && currentSlide === 0) heroMarginBottom = "mt-[20px]";
  if (isMobile && currentSlide > 0) heroMarginBottom = "mt-[20px]";

  return (
    <div className={`w-full relative`}>
      <Slider {...settings}>
        {images.map((src, i) => (
          <div key={i} className="relative">
            {/* Wrapper commun pour toutes les slides */}
            <div className="w-full aspect-[16/9] overflow-hidden relative">
              {i === 0 ? (
                <>
                  <img
                    src={src}
                    alt="hero"
                    className="w-full h-full object-cover block"
                  />
                  <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                  <div className="absolute inset-0 flex items-center">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                        <div className="text-white">
                          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Révélez la beauté de vos cheveux
                          </h1>
                          <p className="text-xl mb-8 leading-relaxed opacity-90">
                            Découvrez notre collection exclusive de produits
                            capillaires naturels, spécialement conçus pour
                            sublimer et nourrir vos cheveux texturés.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/products">
                              <button className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer">
                                Découvrir nos produits
                              </button>
                            </Link>
                            <Link to="/products">
                              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 whitespace-nowrap cursor-pointer">
                                En savoir plus
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/products">
                  <img
                    src={src}
                    alt={`banner_${i}`}
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover cursor-pointer block"
                    loading="lazy"
                  />
                </Link>
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Hero;
