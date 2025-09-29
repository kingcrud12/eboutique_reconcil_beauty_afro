import React from "react";

export default function Hero() {
  return (
    <section
      className="relative bg-gradient-to-r from-amber-50 to-orange-50 min-h-screen flex items-center"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Beautiful%20African%20woman%20with%20natural%20curly%20hair%20in%20a%20modern%20salon%20setting%2C%20warm%20lighting%2C%20minimalist%20background%20with%20soft%20golden%20tones%2C%20professional%20hair%20care%20products%20visible%2C%20elegant%20and%20sophisticated%20atmosphere%2C%20high-end%20beauty%20photography%20style&width=1920&height=1080&seq=hero1&orientation=landscape')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Révélez la beauté de vos cheveux
            </h1>
            <p className="text-xl mb-8 leading-relaxed opacity-90">
              Découvrez notre collection exclusive de produits capillaires
              naturels, spécialement conçus pour sublimer et nourrir vos cheveux
              texturés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer">
                Découvrir nos produits
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 whitespace-nowrap cursor-pointer">
                En savoir plus
              </button>
            </div>
          </div>

          {/* Option: right column for image or promo cards (kept empty to stay faithful) */}
          <div></div>
        </div>
      </div>
    </section>
  );
}
