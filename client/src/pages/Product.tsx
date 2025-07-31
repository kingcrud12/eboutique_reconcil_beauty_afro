import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { IProduct } from "../api/product.interface";

function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      api.get(`/products/${productId}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Erreur produit :", err))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (!product) return <div className="p-6 text-red-600 text-center">Produit introuvable</div>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mt-[100px] text-center">Détails du produit</h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-[50px]">
        {/* Image */}
        <div className="flex justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full max-w-xs h-auto object-contain rounded"
          />
        </div>

        {/* Détails texte */}
        <div className="space-y-3 text-sm sm:text-base text-gray-800">
          <p><strong>Nom :</strong> {product.name}</p>
          <p><strong>Description :</strong> {product.description}</p>
          <p><strong>Prix :</strong> <span className="text-green-600 font-semibold">{product.price} €</span></p>
          <p><strong>Stock :</strong> {product.stock}</p>

          <button
            onClick={() => navigate('/Products')}
            className="mt-4 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded transition w-full sm:w-auto"
          >
            ⬅️ Retour
          </button>
        </div>
      </div>
    </div>
  );
}

export default Product;
