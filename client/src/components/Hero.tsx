import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

function Hero() {
  const settings = {
    dots: true, // petits points en bas
    infinite: true, // boucle infinie
    speed: 100,
    slidesToShow: 1, // une image à la fois
    slidesToScroll: 1,
    autoplay: true, // défilement auto
    autoplaySpeed: 4000, // 4s par image
    arrows: false, // pas de flèches
  };

  const images = ["/banner_1.png", "/banner_6.png"];

  return (
    <div className="w-full relative mt-[50px]">
      <Slider {...settings}>
        {images.map((src, i) => (
          <div key={i}>
            <Link to="/products" aria-label="Voir les produits">
              <img
                src={src}
                alt={`banner_${i}`}
                className="w-full sm:h-[400px] md:h-[600px] lg:h-full object-cover cursor-pointer"
              />
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Hero;
