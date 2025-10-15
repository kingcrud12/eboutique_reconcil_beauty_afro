import React from "react";
import { 
  Leaf, 
  FlaskConical, 
  Heart, 
  Sparkles, 
  Atom, 
  Recycle 
} from "lucide-react";

const ProductIcons = () => {
  const icons = [
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      label: "ORGANIC",
      description: "Produits biologiques",
      animationDelay: "0s"
    },
    {
      icon: <FlaskConical className="w-12 h-12 text-pink-500" />,
      label: "NO CHEMICALS",
      description: "Sans produits chimiques",
      animationDelay: "0.2s"
    },
    {
      icon: <Heart className="w-12 h-12 text-red-500" />,
      label: "CRUELTY FREE",
      description: "Non testé sur les animaux",
      animationDelay: "0.4s"
    },
    {
      icon: <Sparkles className="w-12 h-12 text-blue-500" />,
      label: "VEGAN FRIENDLY",
      description: "Compatible végan",
      animationDelay: "0.6s"
    },
    {
      icon: <Atom className="w-12 h-12 text-purple-600" />,
      label: "NO PARABENS",
      description: "Sans parabènes",
      animationDelay: "0.8s"
    },
    {
      icon: <Recycle className="w-12 h-12 text-green-500" />,
      label: "RECYCLABLE PLASTIC",
      description: "Emballage recyclable",
      animationDelay: "1s"
    }
  ];

  return (
    <div className="w-full mb-8">
      {/* Desktop: une seule ligne */}
      <div className="hidden sm:flex justify-between items-center px-4 sm:px-8 lg:px-16">
        {icons.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center group"
          >
            <div 
              className="bg-white rounded-full p-4 sm:p-5 shadow-xl border-2 border-gray-100 group-hover:border-gray-200 transition-all duration-500 animate-spin-dance"
              style={{ animationDelay: item.animationDelay }}
            >
              {item.icon}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 mt-3 text-center max-w-[100px] leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile: deux rangées de trois icônes */}
      <div className="sm:hidden">
        {/* Première rangée */}
        <div className="flex justify-between items-center px-2 mb-4">
          {icons.slice(0, 3).map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center group"
            >
              <div 
                className="bg-white rounded-full p-3 shadow-xl border-2 border-gray-100 group-hover:border-gray-200 transition-all duration-500 animate-spin-dance"
                style={{ animationDelay: item.animationDelay }}
              >
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 mt-2 text-center max-w-[80px] leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Deuxième rangée */}
        <div className="flex justify-between items-center px-2">
          {icons.slice(3, 6).map((item, index) => (
            <div 
              key={index + 3}
              className="flex flex-col items-center group"
            >
              <div 
                className="bg-white rounded-full p-3 shadow-xl border-2 border-gray-100 group-hover:border-gray-200 transition-all duration-500 animate-spin-dance"
                style={{ animationDelay: item.animationDelay }}
              >
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 mt-2 text-center max-w-[80px] leading-tight">
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
