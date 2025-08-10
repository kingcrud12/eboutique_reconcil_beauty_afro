import React, { useEffect, useState } from "react";
import api from "../api/api";
import { IProduct } from "../api/product.interface";
import { Link } from "react-router-dom";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const categories = ["Tous", "hair", "body"];

const Products = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const { fetchCart, firstCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error(err);
        setPopinMsg("Échec du chargement des produits");
      })
      .finally(() => setLoading(false));
  }, []);

  const truncated = (text: string, max = 120) =>
    text?.length > max ? text.slice(0, max).trim() + "…" : text;

  // 👇 Pour boutons classiques
  const handleAdd = async (productId: number) => {
    if (!isAuthenticated || !user) {
      setPopinMsg("Veuillez vous connecter pour ajouter un produit");
      return;
    }

    setAddingId(productId);
    try {
      let cartId: number;

      if (!firstCart) {
        const res = await api.post("/cart", {
          userId: user.id,
          items: [{ productId, quantity: 1 }],
        });
        cartId = res.data.id;
      } else {
        cartId = firstCart.id;
        await api.put(`/cart/${cartId}`, {
          items: [{ productId, quantity: 1 }],
        });
      }

      await fetchCart();
      setPopinMsg("Produit ajouté au panier!");
    } catch (err) {
      console.error("Erreur ajout article :", err);
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
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white mt-[80px] font-sans">
      {popinMsg && <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />}

      <div className="mb-8 flex justify-center">
        <select
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
          className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between text-center max-w-xs mx-auto h-full"
        >
          <div className="flex flex-col items-center">
            <img
              src={p.imageUrl}
              alt={p.name}
              className="h-32 sm:h-40 object-contain mb-4"
            />
            <Link to={`/product/${p.id}`} className="w-full">
              <h3 className="font-semibold text-gray-800 mb-2">{p.name.slice(0, 60)}</h3>
              <p className="text-sm text-slate-600 line-clamp-3 min-h-[60px]">
                {truncated(p.description)}
              </p>
              <p className="text-green-600 font-bold mt-3">
                {Number(p.price).toFixed(2)} €
              </p>
            </Link>
          </div>
        
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
