import React, { useEffect, useState } from "react";
import api from "../api/api";
import { IProduct } from "../api/product.interface";
import { Link } from "react-router-dom";

const categories = ["Tous", "hair", "body"];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Erreur chargement produits :", err));
  }, []);

  const truncateText = (text: string, maxLength = 120): string => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength).trim() + "…" : text;
  };

  const filteredProducts =
    selectedCategory === "Tous"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-16 px-4 text-center bg-white font-sans">
      {/* En-tête */}
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-10">
        Nos Produits
      </h2>
      <p className="text-gray-500 mt-2 mb-10 text-sm sm:text-base">
        Commandez pour vous ou vos proches
      </p>

      {/* Sélecteur de catégorie */}
      <div className="mb-12 flex justify-center">
        <select
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "hair"
                ? "Produits capillaires"
                : cat === "body"
                ? "Produits corporels"
                : "Tous"}
            </option>
          ))}
        </select>
      </div>

      {/* Grille produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center max-w-xs mx-auto"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-32 sm:h-40 object-contain mb-4"
            />
            <Link to={`/product/${product.id}`} className="w-full">
              <h3 className="font-semibold text-gray-800 text-base mb-2 font-sans">
                {product.name}
              </h3>
              <p className="text-sm text-slate-600 mt-1 text-center line-clamp-3">
                {truncateText(product.description)}
              </p>
              <p className="text-green-600 font-bold mt-3 text-base">
                {product.price} €
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
