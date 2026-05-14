import React from "react";
import {
  Leaf,
  Truck,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

const values = [
  {
    icon: <Leaf className="w-6 h-6 text-sage-600" />,
    title: "Ingrédients naturels",
    subtitle: "100% bio certifiés",
  },
  {
    icon: <Truck className="w-6 h-6 text-sage-600" />,
    title: "Livraison rapide",
    subtitle: "Offerte dès 35€",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-sage-600" />,
    title: "Qualité garantie",
    subtitle: "Fabrication artisanale",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-sage-600" />,
    title: "Paiement sécurisé",
    subtitle: "CB, PayPal, Virement",
  },
];

const ingredients = [
  { name: "Beurre de Karité", latin: "Butyrospermum parkii", benefit: "Nourrissant, protecteur" },
  { name: "Huile de Coco", latin: "Cocos nucifera", benefit: "Hydratant, fortifiant" },
  { name: "Huile de Ricin", latin: "Ricinus communis", benefit: "Croissance, épaississement" },
  { name: "Aloe Vera", latin: "Aloe barbadensis", benefit: "Apaisant, hydratant" },
  { name: "Huile d'Argan", latin: "Argania spinosa", benefit: "Brillance, douceur" },
];

const ProductIcons = () => {
  return (
    <>
      {/* Values Bar */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5">
            {values.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-sage-50 flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{v.title}</p>
                  <p className="text-xs text-gray-500">{v.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="w-full bg-white py-10 md:py-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex flex-col items-center text-center group w-[130px]">
                <div className="w-16 h-16 rounded-full bg-sage-50 border-2 border-sage-200 flex items-center justify-center mb-3 group-hover:border-sage-400 transition-colors">
                  <Leaf className="w-7 h-7 text-sage-500" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{ing.name}</p>
                <p className="text-[11px] text-gray-400 italic">{ing.latin}</p>
                <p className="text-xs text-sage-600 font-medium mt-1">{ing.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductIcons;
