import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

function Hero() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 100,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
  };

  const images = ["/banner_5.png", "/banner_1.png", "/Black_hair2.jpg"];

  return (
    <div className="w-full relative mt-[50px]">
      <Slider {...settings}>
        {images.map((src, i) => (
          <div key={i} className="relative">
            {i === 2 ? (
              // Image avec overlay + texte
              <section
                className="relative bg-gradient-to-r from-amber-50 to-orange-50 flex items-center"
                style={{
                  backgroundImage: `url('${src}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="w-full aspect-[16/9] min-h-[600px]"></div>
                <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center">
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
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
                          <Link to="/products" aria-label="Voir les produits">
                            <button className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer">
                              Découvrir nos produits
                            </button>
                          </Link>
                          <Link to="/products" aria-label="Voir les produits">
                            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 whitespace-nowrap cursor-pointer">
                              En savoir plus
                            </button>
                          </Link>
                        </div>
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              // Autres images
              <Link to="/products" aria-label="Voir les produits">
                <div className="w-full aspect-[16/9] min-h-[600px] bg-gray-50 overflow-hidden">
                  <picture>
                    {/* version mobile si largeur < 768px */}
                    {src === "/banner_1.png" && (
                      <source
                        media="(max-width: 768px)"
                        srcSet="/banner_1_mobile.png"
                      />
                    )}
                    {/* fallback desktop */}
                    <img
                      src={src}
                      alt={`banner_${i}`}
                      width={1920}
                      height={1080}
                      className="w-full h-full object-cover cursor-pointer block"
                      loading="lazy"
                    />
                  </picture>
                </div>
              </Link>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Hero;
