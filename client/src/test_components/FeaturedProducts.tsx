import React from "react";
import ProductCard, { Product } from "./ProductCard";

const sampleProducts: Product[] = [
  {
    name: "Shampooing Hydratant Naturel",
    price: "24,99€",
    image:
      "https://readdy.ai/api/search-image?query=Beautiful%20bottle%20of%20natural%20hair%20shampoo%20for%20afro%20hair&width=400&height=400&orientation=squarish",
  },
  {
    name: "Masque Nourrissant Karité",
    price: "32,99€",
    image:
      "https://readdy.ai/api/search-image?query=Luxury%20hair%20mask%20jar%20with%20shea%20butter&width=400&height=400&orientation=squarish",
  },
  {
    name: "Huile Capillaire Bio",
    price: "19,99€",
    image:
      "https://readdy.ai/api/search-image?query=Premium%20organic%20hair%20oil%20bottle%20for%20afro%20hair&width=400&height=400&orientation=squarish",
  },
];

export default function FeaturedProducts({
  products = sampleProducts,
}: {
  products?: Product[];
}) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nos produits phares
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une sélection de produits naturels et efficaces pour tous types de
            cheveux afro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <ProductCard key={i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
