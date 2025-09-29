import React from "react";

export type Product = {
  name: string;
  price: string;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4">
          Formule naturelle pour cheveux texturés
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-teal-600">
            {product.price}
          </span>
          <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 whitespace-nowrap cursor-pointer">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
