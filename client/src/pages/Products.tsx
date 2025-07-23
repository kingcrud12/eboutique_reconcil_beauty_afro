import React, { useState } from "react";

const allProducts = [
  {
    name: "Shampoo",
    category: "Produits capillaires",
    description: "A refreshing shampoo for clean and healthy hair.",
    price: "14.99$",
    image: "/image_1.png",
  },
  {
    name: "Body Cream",
    category: "Produits corporels",
    description: "Hydrating cream for soft skin.",
    price: "12.99$",
    image: "/image_1.png",
  },
  {
    name: "Scented Soap",
    category: "Savons",
    description: "Natural soap with essential oils.",
    price: "7.99$",
    image: "/image_1.png",
  },
  {
    name: "Hair Oil",
    category: "Produits capillaires",
    description: "Nourishing oil for strong and shiny hair.",
    price: "9.99$",
    image: "/image_1.png",
  },
  {
    name: "Afro Comb",
    category: "Accessoires",
    description: "Essential comb for curly and coily hair.",
    price: "5.99$",
    image: "/image_1.png",
  },
  {
    name: "Afro Cream",
    category: "Accessoires",
    description: "Essential comb for curly and coily hair.",
    price: "6.99$",
    image: "/image_1.png",
  },
];

const categories = [
  "Tous",
  "Produits capillaires",
  "Produits corporels",
  "Accessoires",
  "Savons",
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredProducts =
    selectedCategory === "Tous"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className="mt-[90px] px-6 py-16 bg-white text-slate-800">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Nos produits</h1>
        <p className="text-slate-500 mt-2">Order it for you or for your beloved ones</p>
      </div>

      {/* Selecteur de catégorie */}
      <div className="mb-12 flex justify-center">
        <select
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {filteredProducts.map((product, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-64 w-full object-contain mb-4"
            />
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-sm text-slate-500 mt-2">{product.description}</p>
            <p className="text-green-600 font-bold text-lg mt-3">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
