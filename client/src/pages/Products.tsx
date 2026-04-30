import React, { useEffect, useState } from "react";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { Link, useParams, useNavigate } from "react-router-dom";
import { createProductSlug, createSlug } from "../utils/urlUtils";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Star, ShoppingCart } from "lucide-react";

const categories = ["Tous", "hair", "body"];
const categoryLabels: Record<string, string> = {
  Tous: "Tous les produits",
  hair: "Soins Cheveux",
  body: "Soins Corps",
};

// Mappe les slugs aux valeurs internes
const slugToCategory: Record<string, string> = {
  "soins-cheveux": "hair",
  "soins-corps": "body"
};

const Products = () => {
  const { categoryFilter } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);
  
  // Utilise categoryFilter si présent, sinon "Tous"
  const initialCategory = categoryFilter && slugToCategory[categoryFilter] ? slugToCategory[categoryFilter] : "Tous";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    if (categoryFilter && slugToCategory[categoryFilter]) {
      setSelectedCategory(slugToCategory[categoryFilter]);
    } else if (!categoryFilter) {
      setSelectedCategory("Tous");
    }
  }, [categoryFilter]);

  const { fetchCart, fetchGuestCart, createGuestCart, firstCart, updateGuestCart, setCarts } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    api.get("/products")
      .then((res) => setProducts(res.data ?? []))
      .catch((err) => { console.error(err); setPopinMsg("Échec du chargement des produits"); })
      .finally(() => setLoading(false));
  }, []);

  const truncated = (text: string, max = 60) =>
    text?.length > max ? text.slice(0, max).trim() + "…" : text;

  const handleAdd = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return setPopinMsg("Produit introuvable.");
    if (Number(product.stock) <= 0) return setPopinMsg("Produit indisponible.");

    setAddingId(productId);
    setCarts((prev) => {
      const current = prev[0] ?? { id: firstCart?.id ?? 0, createdAt: new Date().toISOString(), items: [] };
      const existing = current.items.find((i) => i.product.id === product.id);
      let items;
      if (existing) {
        items = current.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        items = [...current.items, { id: -(Math.floor(Math.random() * 100000) + 1), productId: product.id, quantity: 1, product }];
      }
      return [{ ...current, items }];
    });
    setPopinMsg("Produit ajouté au panier !");

    try {
      if (isAuthenticated && user) {
        let cartId: number;
        if (!firstCart) {
          const res = await api.post("/carts", { userId: user.id, items: [{ productId, quantity: 1 }] });
          cartId = res.data.id;
        } else {
          cartId = firstCart.id;
          await api.patch(`/carts/users/me/${cartId}`, { items: [{ productId, quantity: 1 }] });
        }
        await fetchCart();
      } else {
        const updated = await updateGuestCart({ items: [{ productId, quantity: 1 }] });
        if (!updated) await createGuestCart({ items: [{ productId, quantity: 1 }] });
        await fetchGuestCart();
      }
    } catch (err) {
      console.error("Erreur ajout article :", err);
      setPopinMsg("Impossible d'ajouter l'article");
      if (isAuthenticated && user) await fetchCart(); else await fetchGuestCart();
    } finally {
      setAddingId(null);
    }
  };

  const filtered = selectedCategory === "Tous" ? products : products.filter((p) => p.category === selectedCategory);

  if (loading) return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Chargement des produits...</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {popinMsg && <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />}

      {/* Header */}
      <div className="bg-sage-50 py-12 text-center">
        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-3">Nos Produits</h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto">
          Découvrez notre gamme de soins naturels pour cheveux afro & bouclés
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        {/* Category filter */}
        <div className="flex justify-center gap-3 mb-10">
          {categories.map((cat) => {
            // Find the slug for this category
            const slug = Object.keys(slugToCategory).find(key => slugToCategory[key] === cat);
            const path = cat === "Tous" ? "/shop/products" : `/shop/products/${slug}`;
            
            return (
              <button
                key={cat}
                onClick={() => navigate(path)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-sage-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => {
            const isOutOfStock = Number(p.stock) <= 0;
            const isAdding = addingId === p.id;

            return (
              <article key={p.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                {/* Image */}
                <Link
                  to={`/shop/product/${createSlug(p.category)}/${createProductSlug(p.id, p.name)}`}
                  className="block w-full aspect-square bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden"
                >
                  <img src={p.imageUrl} alt={p.name} loading="lazy"
                    className="max-w-[75%] max-h-[75%] object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                    style={{ mixBlendMode: "multiply" }} />
                  {isOutOfStock && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">Épuisé</span>
                  )}
                </Link>

                {/* Body */}
                <div className="p-4 sm:p-5">
                  <Link to={`/shop/product/${createSlug(p.category)}/${createProductSlug(p.id, p.name)}`}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-sage-700 transition-colors">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{truncated(p.description)}</p>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>

                  {/* Price */}
                  <p className="text-lg font-bold text-gray-800 mb-3">{Number(p.price).toFixed(2)}€</p>

                  {/* CTA */}
                  <button
                    onClick={() => handleAdd(p.id)}
                    disabled={isAdding || isOutOfStock}
                    className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isAdding
                          ? "bg-gray-200 text-gray-500 cursor-wait"
                          : "bg-sage-600 text-white hover:bg-sage-700"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock ? "Indisponible" : isAdding ? "Ajout..." : "Ajouter au panier"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Products;
