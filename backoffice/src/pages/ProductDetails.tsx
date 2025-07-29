import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { IProduct } from "../api/product.interfaces";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  useEffect(() => {
    if (productId) {
      api.get(`/products/${productId}`)
        .then((res) => {
          setProduct(res.data);
          setForm({
            name: res.data.name,
            description: res.data.description,
            price: res.data.price,
            stock: res.data.stock,
            category: res.data.category || "",
          });
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!productId) return;
    try {
      await api.patch(`/products/${productId}`, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      alert("Produit mis à jour avec succès !");
      navigate("/products");
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!product) return <div className="p-6 text-red-600">Produit introuvable</div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Détail du produit</h2>

      <div className="space-y-4">
        <img
          src={`http://localhost:3003${product.imageUrl}`}
          alt={product.name}
          className="w-[-20px] h-32 object-cover rounded border"
        />

        <div className="space-y-2">
          <label className="block font-medium">Nom</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Prix (€)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Catégorie (optionnel)</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={handleUpdate}
            className=" text-white px-6 py-2 rounded bg-gray-900"
          >
            ✅ Mettre à jour
          </button>

          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white px-4 py-2 rounded"
          >
            ⬅️ Retour
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
