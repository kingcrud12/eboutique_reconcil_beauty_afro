import React, { useEffect, useState } from "react";
import api from "../api/api";
import { IProduct } from "../api/product.interface";
import { Link } from "react-router-dom";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const categories = ["Tous", "hair", "body"];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);

  const { fetchCart, firstCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error("Erreur chargement produits :", err);
        setPopinMsg("Échec de chargement des produits");
      })
      .finally(() => setLoading(false));
  }, []);

  const truncated = (text: string, max = 120) =>
    text?.length > max ? text.slice(0, max).trim() + "…" : text;

  const handleAdd = async (id: number) => {
    if (!isAuthenticated) {
      setPopinMsg("Veuillez vous connecter pour ajouter un produit");
      return;
    }
    if (!firstCart) {
      setPopinMsg("Aucun panier actif trouvé");
      return;
    }
    try {
      setAddingId(id);
      await api.put(`/cart/${firstCart.id}`, {
        items: [{ productId: id, quantity: 1 }],
      });
      await fetchCart();
      setPopinMsg("Produit ajouté au panier !");
    } catch (err) {
      console.error(err);
      setPopinMsg("Impossible d’ajouter l’article");
    } finally {
      setAddingId(null);
    }
  };

  const filtered =
    selectedCategory === "Tous"
      ? products
      : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return <div className="py-16 text-center">Chargement...</div>;
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-sans mt-[80px]">
      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      <div className="mb-8 flex justify-center">
        <select
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md flex flex-col items-center text-center max-w-xs mx-auto"
          >
            <img
              src={p.imageUrl}
              alt={p.name}
              className="h-32 sm:h-40 object-contain mb-4"
            />
            <Link to={`/product/${p.id}`} className="w-full">
              <h3 className="font-semibold text-gray-800 mb-2">{p.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-3">
                {truncated(p.description)}
              </p>
              <p className="text-green-600 font-bold mt-3">{p.price} €</p>
            </Link>
            <button
              onClick={() => handleAdd(p.id)}
              disabled={addingId === p.id}
              className={`mt-4 px-4 py-2 text-white rounded ${
                addingId === p.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-blue-700"
              }`}
            >
              {addingId === p.id ? "Ajout..." : "Ajouter au panier"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
