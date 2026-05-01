import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { extractIdFromSlug } from "../utils/urlUtils";
import { Leaf, Truck, ShieldCheck, ArrowLeft, ShoppingBag } from "lucide-react";

function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour l'ajout au panier / UI
  const [adding, setAdding] = useState(false);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);

  const {
    fetchCart,
    fetchGuestCart,
    createGuestCart,
    firstCart,
    updateGuestCart,
    setCarts,
  } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (slug) {
      const id = extractIdFromSlug(slug);
      api
        .get(`/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => {
          console.error("Erreur produit :", err);
          setPopinMsg("Erreur lors du chargement du produit.");
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  // Formatage du prix en euros (FR)
  const formatPrice = (raw: any) => {
    if (raw === undefined || raw === null) return null;
    const asNumber =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw.trim().replace(",", "."))
          : NaN;
    if (!Number.isFinite(asNumber)) return null;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(asNumber);
  };

  // Affiche la description **textuellement** en conservant tous les retours à la ligne
  // et l'indentation (utile pour les listes, astérisques, emojis, etc.).
  const renderFullDescription = (description: string | undefined) => {
    if (!description) return null;
    // Normaliser CRLF -> LF et supprimer caractères indésirables éventuels
    const normalized = description.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    return (
      <div
        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
        // On utilise un rôle pour mieux l'accessibilité : c'est du texte préformaté
        role="article"
        aria-label="Description du produit"
      >
        {normalized}
      </div>
    );
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (!product)
    return (
      <div className="p-6 text-red-600 text-center">Produit introuvable</div>
    );

  const isOutOfStock = Number(product.stock) <= 0;
  const priceString = formatPrice(product.price);


  // --- Logic d'ajout au panier (repris depuis Products)
  const handleAdd = async () => {
    if (!product) return setPopinMsg("Produit introuvable.");
    if (Number(product.stock) <= 0) return setPopinMsg("Produit indisponible.");

    setAdding(true);
    // Optimistic UI: update cart state immediately
    setCarts((prev) => {
      const current = prev[0] ?? {
        id: firstCart?.id ?? 0,
        createdAt: new Date().toISOString(),
        items: [],
      };
      const existing = current.items.find((i) => i.product.id === product.id);
      let items;
      if (existing) {
        items = current.items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        items = [
          ...current.items,
          {
            id: -(Math.floor(Math.random() * 100000) + 1),
            productId: product.id,
            quantity: 1,
            product,
          },
        ];
      }
      return [{ ...current, items }];
    });
    setPopinMsg("Produit ajouté au panier !");
    try {
      if (isAuthenticated && user) {
        // Utilisateur connecté: conserver le flux existant
        let cartId: number;
        if (!firstCart) {
          const res = await api.post("/carts", {
            userId: user.id,
            items: [{ productId: product.id, quantity: 1 }],
          });
          cartId = res.data.id;
        } else {
          cartId = firstCart.id;
          await api.patch(`/carts/users/me/${cartId}`, {
            items: [{ productId: product.id, quantity: 1 }],
          });
        }
        await fetchCart();
      } else {
        // Invité: essayer PATCH d'abord; si échec => POST puis refresh
        const updated = await updateGuestCart({
          items: [{ productId: product.id, quantity: 1 }],
        });
        if (!updated) {
          await createGuestCart({
            items: [{ productId: product.id, quantity: 1 }],
          });
        }
        await fetchGuestCart();
      }
    } catch (err) {
      console.error("Erreur ajout article :", err);
      setPopinMsg("Impossible d’ajouter l’article");
      // Re-sync in case optimistic update was wrong
      if (isAuthenticated && user) await fetchCart();
      else await fetchGuestCart();
    } finally {
      setAdding(false);
    }
  };
  // --- fin logique ajout

  return (
    <article className="font-sans bg-[#F9F9F8] min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        {popinMsg && (
          <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
        )}

        <button
          onClick={() => navigate("/products")}
          className="mb-10 text-sm font-medium text-sage-600 hover:text-sage-800 transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la boutique
        </button>

        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Image */}
            <div className="p-8 lg:p-16 flex items-center justify-center bg-gradient-to-br from-sage-50/50 to-white border-b lg:border-b-0 lg:border-r border-gray-100/50">
              <div className="relative w-full max-w-lg aspect-square flex items-center justify-center group">
                {/* Subtle decorative background circle */}
                <div className="absolute inset-0 bg-sage-100/50 rounded-full blur-3xl scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="relative z-10 w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105 drop-shadow-xl"
                />
                {isOutOfStock && (
                  <div className="absolute top-4 left-4 z-20 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Épuisé
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details & Actions */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-bold text-sage-600 uppercase tracking-[0.2em] bg-sage-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-8">
                <div className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
                  {priceString ? priceString : <span className="text-xl text-gray-500 font-normal">Prix indisponible</span>}
                </div>
                <span className="text-sm text-gray-400 font-medium">TTC</span>
              </div>

              <div className="prose prose-sage prose-p:leading-loose text-gray-600 mb-12 max-w-none text-[15px]">
                {renderFullDescription(product.description)}
              </div>

              <div className="space-y-4 mb-14">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock || adding}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                    isOutOfStock || adding
                      ? "bg-gray-100 cursor-not-allowed text-gray-400 shadow-none"
                      : "bg-gray-900 text-white hover:bg-sage-700 hover:shadow-xl hover:shadow-sage-700/20 hover:-translate-y-0.5"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isOutOfStock
                    ? "Indisponible actuellement"
                    : adding
                      ? "Ajout en cours..."
                      : "Ajouter au panier"}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-sage-600 group-hover:scale-110 group-hover:bg-sage-100 transition-all duration-300">
                    <Leaf className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 tracking-wide">100% Naturel</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-sage-600 group-hover:scale-110 group-hover:bg-sage-100 transition-all duration-300">
                    <Truck className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 tracking-wide">Livraison Rapide</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-sage-600 group-hover:scale-110 group-hover:bg-sage-100 transition-all duration-300">
                    <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 tracking-wide">Paiement Sécurisé</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default Product;
