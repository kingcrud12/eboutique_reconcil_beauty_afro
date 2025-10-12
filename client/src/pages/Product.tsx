import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import Popin from "../components/Popin";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour l'ajout au panier / UI
  const [adding, setAdding] = useState(false);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { fetchCart, firstCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (productId) {
      api
        .get(`/products/${productId}`)
        .then((res) => setProduct(res.data))
        .catch((err) => {
          console.error("Erreur produit :", err);
          setPopinMsg("Erreur lors du chargement du produit.");
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

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

  // Prépare l'affichage du poids (ajoute 'g' si c'est un nombre)
  const weightDisplay =
    product.weight === null || product.weight === undefined
      ? "—"
      : typeof product.weight === "number"
      ? `${product.weight} g`
      : String(product.weight);

  // --- Logic d'ajout au panier (repris depuis Products)
  const handleAdd = async () => {
    if (!product) return setPopinMsg("Produit introuvable.");
    if (Number(product.stock) <= 0) return setPopinMsg("Produit indisponible.");

    if (!isAuthenticated || !user) {
      // Affiche la modal si l'utilisateur n'est pas connecté
      setShowAuthModal(true);
      return;
    }

    setAdding(true);
    try {
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
      setPopinMsg("Produit ajouté au panier !");
    } catch (err) {
      console.error("Erreur ajout article :", err);
      setPopinMsg("Impossible d’ajouter l’article");
    } finally {
      setAdding(false);
    }
  };
  // --- fin logique ajout

  return (
    <div className="font-sans bg-white min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Popin pour messages */}
        {popinMsg && (
          <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
        )}

        {/* Modal de connexion si nécessaire */}
        {showAuthModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white p-6 rounded shadow-md w-[320px] text-center">
              <h2 className="text-lg font-bold mb-4">Connexion requise</h2>
              <p className="text-sm mb-6">
                Vous devez être connecté pour ajouter un produit au panier.
              </p>
              <div className="flex justify-center gap-2">
                {/* Redirige vers /login avec l'URL courante en state */}
                <Link
                  to={`/login?state=${encodeURIComponent(
                    `${location.pathname}${location.search}${
                      location.hash || ""
                    }`
                  )}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Se connecter
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Title large */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight max-w-3xl">
            {product.name}
          </h1>
          <div className="mt-6 w-24 h-1 bg-yellow-400 rounded mx-0"></div>
        </header>

        {/* Main grid: image left, info right */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: image (spans 7 on md) */}
          <div className="md:col-span-7 flex items-start justify-center">
            <div className="w-full max-w-md md:max-w-none">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-auto object-contain rounded-md shadow"
              />
            </div>
          </div>

          {/* Right: price, actions, small meta */}
          <aside className="md:col-span-5">
            {/* Price centered and big */}
            <div className="flex flex-col items-center md:items-stretch md:text-left">
              <div className="mb-6 md:mb-8">
                {priceString ? (
                  <div className="text-center md:text-left">
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                      {priceString}
                    </div>
                  </div>
                ) : (
                  <div className="text-lg text-gray-600">
                    Prix non disponible
                  </div>
                )}
              </div>

              {/* Actions (Add to cart, payment placeholders) */}
              <div className="flex flex-col gap-3 items-center md:items-stretch mb-6">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock || adding}
                  className={`w-64 md:w-full max-w-xs md:max-w-none px-6 py-3 rounded-full text-white font-semibold transition ${
                    isOutOfStock || adding
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:opacity-95"
                  }`}
                >
                  {isOutOfStock
                    ? "Indisponible"
                    : adding
                    ? "Ajout..."
                    : "Ajouter au panier"}
                </button>

                {/* Placeholder pour options de paiement (inspiré visuel) */}
                <div className="w-64 md:w-full max-w-xs md:max-w-none space-y-3 mt-2">
                  <div className="h-10 bg-black rounded-md flex items-center justify-center text-white font-medium">
                    Buy with  Pay
                  </div>
                  <div className="h-10 bg-black rounded-md flex items-center justify-center text-white font-medium">
                    G Pay • ••• 0249
                  </div>
                  <div className="h-10 bg-emerald-500 rounded-md flex items-center justify-center text-white font-medium">
                    link • VISA 9318
                  </div>
                </div>
              </div>

              {/* Category / small meta (stock caché) */}
              <div className="text-sm text-gray-600 mt-2 md:mt-4 text-center md:text-left">
                <div>Catégorie: {product.category}</div>
              </div>
            </div>
          </aside>

          {/* Full width description: align under left column on md+ */}
          <div className="md:col-span-7 mt-6">
            <div className="prose prose-sm text-gray-800 max-w-none">
              <h2 className="sr-only">Description</h2>
              {renderFullDescription(product.description)}
            </div>
          </div>
        </section>

        {/* Additional info / back button */}
        <div className="mt-12 flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
          <div className="text-sm text-gray-600">
            <div>
              <span className="font-semibold">Poids:</span>{" "}
              <span>{weightDisplay}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/products")}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition"
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
