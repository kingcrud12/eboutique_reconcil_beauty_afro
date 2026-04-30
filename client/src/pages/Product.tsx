import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { extractIdFromSlug } from "../utils/urlUtils";

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
    <article className="font-sans bg-sage-50 min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {popinMsg && (
          <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
        )}

        <button
          onClick={() => navigate("/shop/products")}
          className="mb-8 text-sm font-medium text-sage-600 hover:text-sage-800 transition-colors flex items-center gap-2"
        >
          &larr; Retour à la boutique
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Image */}
            <div className="p-8 lg:p-12 flex items-center justify-center bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="relative w-full max-w-md aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
                {isOutOfStock && (
                  <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Épuisé
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details & Actions */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-xs font-semibold text-sage-600 uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                {priceString ? priceString : <span className="text-lg text-gray-500">Prix indisponible</span>}
              </div>

              <div className="prose prose-sage prose-sm text-gray-600 mb-10 max-w-none">
                {renderFullDescription(product.description)}
              </div>

              <div className="space-y-4 mb-10">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock || adding}
                  className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all shadow-sm ${
                    isOutOfStock || adding
                      ? "bg-gray-300 cursor-not-allowed text-gray-500 shadow-none"
                      : "bg-sage-600 hover:bg-sage-700 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {isOutOfStock
                    ? "Indisponible actuellement"
                    : adding
                      ? "Ajout en cours..."
                      : "Ajouter au panier"}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                <div className="flex flex-col items-center text-center p-3 bg-sage-50 rounded-xl">
                  <span className="text-xl mb-2">🌿</span>
                  <span className="text-xs font-medium text-sage-800">100% Naturel</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-sage-50 rounded-xl">
                  <span className="text-xl mb-2">🚚</span>
                  <span className="text-xs font-medium text-sage-800">Livraison Rapide</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-sage-50 rounded-xl">
                  <span className="text-xl mb-2">🔒</span>
                  <span className="text-xs font-medium text-sage-800">Paiement Sécurisé</span>
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
