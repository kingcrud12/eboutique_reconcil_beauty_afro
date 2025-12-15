import React, { useState, useEffect } from "react";
import {
  Leaf,
  FlaskConical,
  Heart,
  Sparkles,
  Atom,
  Recycle,
} from "lucide-react";

const initialIcons = [
  {
    id: 1,
    icon: <Leaf className="w-12 h-12 text-green-600" />,
    label: "ORGANIC",
    description: "Produits biologiques",
  },
  {
    id: 2,
    icon: <FlaskConical className="w-12 h-12 text-pink-500" />,
    label: "NO CHEMICALS",
    description: "Sans produits chimiques",
  },
  {
    id: 3,
    icon: <Heart className="w-12 h-12 text-red-500" />,
    label: "CRUELTY FREE",
    description: "Non testé sur les animaux",
  },
  {
    id: 4,
    icon: <Sparkles className="w-12 h-12 text-blue-500" />,
    label: "VEGAN FRIENDLY",
    description: "Compatible végan",
  },
  {
    id: 5,
    icon: <Atom className="w-12 h-12 text-purple-600" />,
    label: "NO PARABENS",
    description: "Sans parabènes",
  },
  {
    id: 6,
    icon: <Recycle className="w-12 h-12 text-green-500" />,
    label: "RECYCLABLE PLASTIC",
    description: "Emballage recyclable",
  },
];

const ProductIcons = () => {
  const [icons, setIcons] = useState(initialIcons);
  const [showRabbit, setShowRabbit] = useState(false);

  useEffect(() => {
    const cycle = () => {
      // 1. Show Icons for 4 seconds
      setShowRabbit(false);

      // Shuffle icons continuously while visible
      const shuffleInterval = setInterval(() => {
        setIcons((prev) => [...prev].sort(() => Math.random() - 0.5));
      }, 2000);

      setTimeout(() => {
        clearInterval(shuffleInterval);
        // 2. Show Rabbit for 3 seconds
        setShowRabbit(true);
      }, 5000);
    };

    cycle(); // Initial start
    const mainLoop = setInterval(cycle, 8000); // 5s icons + 3s rabbit = 8s loop

    return () => {
      clearInterval(mainLoop);
    };
  }, []);

  if (showRabbit) {
    return (
      <div className="w-full mb-8 h-40 flex items-center justify-center overflow-hidden gap-8 animate-fade-in">
        <div className="flex flex-col items-center animate-bounce-slow">
          <img
            src="/rabbit_anim.jpg"
            alt="Cruelty Free Rabbit"
            className="w-32 h-32 object-contain rounded-full shadow-lg border-4 border-green-100"
          />
          <span className="font-bold text-green-700 mt-2">100% Cruelty Free</span>
        </div>
        <div className="text-4xl">💚</div>
        <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
          <img
            src="/products_anim.png"
            alt="Natural Products"
            className="w-32 h-32 object-contain rounded-full shadow-lg border-4 border-yellow-100"
          />
          <span className="font-bold text-yellow-700 mt-2">Natural Ingredients</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      {/* Desktop: une seule ligne */}
      <div className="hidden sm:flex justify-between items-center px-4 sm:px-8 lg:px-16 h-40 transition-all duration-500">
        {icons.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center group transition-all duration-700 ease-in-out transform"
          >
            <div className="bg-white rounded-full p-4 sm:p-5 shadow-xl border-2 border-gray-100 group-hover:border-gray-200 animate-spin-slow">
              {item.icon}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 mt-3 text-center max-w-[100px] leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile: une seule rangée de trois icônes (élégant & épuré) */}
      <div className="sm:hidden h-40 flex items-center justify-center transition-all duration-500">
        <div className="flex justify-evenly items-center w-full px-4 gap-4">
          {icons.slice(0, 3).map((item) => (
            <div key={item.id} className="flex flex-col items-center group w-1/3">
              <div className="bg-white rounded-full p-4 shadow-lg border border-gray-100 animate-spin-slow">
                {item.icon}
              </div>
              <span className="text-[10px] font-medium text-gray-600 mt-3 text-center tracking-wide leading-tight uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductIcons;
