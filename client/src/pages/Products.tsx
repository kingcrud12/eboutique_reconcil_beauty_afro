import React, { useEffect, useState } from "react";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { Link } from "react-router-dom";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const categories = ["Tous", "hair", "body"];

const bgVariants = [
  "bg-[#fef5e7]", // beige clair
  "bg-[#fbe8d3]", // pêche clair
  "bg-[#f5e0dc]", // rose poudré
  "bg-[#f3e7d3]", // sable doux
  "bg-[#f6ede2]", // crème
];

const Products = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const { fetchCart, firstCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data ?? []))
      .catch((err) => {
        console.error(err);
        setPopinMsg("Échec du chargement des produits");
      })
      .finally(() => setLoading(false));
  }, []);

  const truncated = (text: string, max = 120) =>
    text?.length > max ? text.slice(0, max).trim() + "…" : text;

  const handleAdd = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      setPopinMsg("Produit introuvable.");
      return;
    }

    const isOutOfStock = Number(product.stock) <= 0;
    if (isOutOfStock) {
      setPopinMsg("Produit indisponible.");
      return;
    }

    if (!isAuthenticated || !user) {
      setPopinMsg("Veuillez vous connecter pour ajouter un produit");
      return;
    }

    setAddingId(productId);
    try {
      let cartId: number;

      if (!firstCart) {
        const res = await api.post("/carts", {
          userId: user.id,
          items: [{ productId, quantity: 1 }],
        });
        cartId = res.data.id;
      } else {
        cartId = firstCart.id;
        await api.patch(`/carts/users/me/${cartId}`, {
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
      : products.filter((p) => p.category === selectedCategory);

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white mt-[80px] font-sans">
      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      <div className="mb-8 flex justify-center">
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

      {/* CARROUSEL */}
      {/* CARROUSEL */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto px-2 py-4 scroll-smooth snap-x snap-mandatory">
        {filtered.map((p, idx) => {
          const isOutOfStock = Number(p.stock) <= 0;
          const isAdding = addingId === p.id;
          const disabled = isAdding || isOutOfStock;
          const bg = bgVariants[idx % bgVariants.length];

          return (
            <article
              key={p.id}
              className="snap-start flex-shrink-0 w-[80%] sm:w-[320px] md:w-[360px] lg:w-[400px] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              {/* IMAGE BLOCK */}
              <div
                className={`w-full h-60 sm:h-72 flex items-center justify-center ${bg}`}
              >
                <Link
                  to={`/product/${p.id}`}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="max-h-48 sm:max-h-56 object-contain block"
                    style={{
                      mixBlendMode: "multiply",
                      background: "transparent",
                    }}
                  />
                </Link>
              </div>

              {/* CARD BODY */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between text-center">
                <div>
                  <Link to={`/product/${p.id}`}>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 min-h-[3.6rem] line-clamp-3">
                      {truncated(p.description)}
                    </p>
                  </Link>
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <button
                    onClick={() => handleAdd(p.id)}
                    disabled={disabled}
                    className={`px-6 sm:px-8 py-3 rounded-full text-white font-semibold ${
                      disabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-900 hover:opacity-95 transition"
                    }`}
                  >
                    {isOutOfStock
                      ? "Indisponible"
                      : isAdding
                      ? "Ajout..."
                      : "Ajouter au panier"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
