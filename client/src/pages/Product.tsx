import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { IProduct } from "../../api/product.interface";

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

  return (
    <div className="font-sans py-16 px-4 sm:px-6 lg:px-8 bg-white min-h-screen mt-[100px] shadow">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          Détails du produit
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-96 w-auto object-contain rounded"
            />
          </div>

          {/* Détails texte */}
          <div className="text-left space-y-4 text-gray-800">
            <p className="text-lg font-semibold">{product.name}</p>

            <div>{formatDescription(product.description)}</div>

            <p>
              <strong>Prix :</strong>{" "}
              <span className="text-green-600 font-semibold">
                {Number(product.price).toFixed(2)} €
              </span>
            </p>
            <p>
              <strong>Stock :</strong> {product.stock}
            </p>

            <button
              onClick={() => navigate("/products")}
              className="mt-4 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded transition w-full sm:w-auto"
            >
              ⬅️ Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
