import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";

function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      api
        .get(`/products/${productId}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Erreur produit :", err))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const formatDescription = (description: string | undefined) => {
    if (!description) return null;

    const parts = description
      .split(/✅/)
      .map((p) => p.trim())
      .filter(Boolean);
    const intro = parts.shift();

    return (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>{intro}</p>
        {parts.length > 0 && (
          <ul className="list-disc list-inside">
            {parts.map((line, index) => (
              <li key={index}>✅ {line}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (!product)
    return (
      <div className="p-6 text-red-600 text-center">Produit introuvable</div>
    );

  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="font-sans py-16 px-4 sm:px-6 lg:px-8 bg-white min-h-screen mt-[100px]">
      <div className="max-w-4xl mx-auto">
        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform hover:-translate-y-1">
          {/* IMAGE */}
          <div className="w-full h-96 flex items-center justify-center bg-[#fef5e7]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-80 object-contain"
              style={{ mixBlendMode: "multiply", background: "transparent" }}
            />
          </div>

          {/* DETAILS */}
          <div className="p-6 sm:p-8 flex flex-col space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
              {product.name}
            </h1>

            <div className="text-gray-700 max-h-[50vh] overflow-y-auto pr-2">
              {formatDescription(product.description)}
            </div>

            <p className="text-lg font-semibold text-center">
              Prix :{" "}
              <span className="text-green-600">
                {Number(product.price).toFixed(2)} €
              </span>
            </p>

            {isOutOfStock && (
              <p className="text-red-600 font-semibold text-center">
                Article indisponible
              </p>
            )}

            <div className="flex justify-center mt-4">
              <button
                onClick={() => navigate("/products")}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                ⬅️ Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
