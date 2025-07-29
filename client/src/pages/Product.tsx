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

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!product) return <div className="p-6 text-red-600">Produit introuvable</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Détail du produit</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex justify-center">
          <img
            src={`${process.env.REACT_APP_BASE_URL}${product.imageUrl}`}
            alt={product.name}
            className="w-64 h-64 object-contain rounded"
          />
        </div>

        <div className="space-y-2">
          <p><strong>Nom :</strong> {product.name}</p>
          <p><strong>Description :</strong> {product.description}</p>
          <p><strong>Prix :</strong> {product.price} €</p>
          <p><strong>Stock :</strong> {product.stock}</p>
        </div>

        <button
          onClick={() => navigate('/Products')}
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
        >
          ⬅️ Retour
        </button>
      </div>
    </div>
  );
}

export default Product;
