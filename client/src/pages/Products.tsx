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

  const filteredProducts =
    selectedCategory === "Tous"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-16 px-4 text-center bg-white">
      {/* En-tête */}
      <h2 className="text-3xl font-bold text-gray-900 mt-10">Nos Produits</h2>
      <p className="text-gray-500 mt-2 mb-10">
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
            className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <img
              src={`${process.env.REACT_APP_BASE_URL}${product.imageUrl}`}
              alt={product.name}
              className="mx-auto h-40 object-contain"
            />
            <Link to={`/product/${product.id}`}>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-slate-500 mt-2">
                  {product.description}
                </p>
                <p className="text-green-600 font-bold mt-1">
                  {product.price} €
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
