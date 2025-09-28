import React, { useEffect, useState } from "react";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Popin from "../components/Popin";

function AnimatedIcon({
  title,
  children,
  className = "",
  delay = "0s",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-28 sm:w-32">
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-sm transform transition-all duration-300 ${className}`}
        style={{ animationDelay: delay }}
        aria-hidden
      >
        {children}
      </div>
      <span className="text-xs text-gray-600 uppercase tracking-wide text-center">
        {title}
      </span>
    </div>
  );
}

function truncateText(text?: string | null, max = 120) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function Product() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);

  const { fetchCart, firstCart, setCarts } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data ?? []))
      .catch((err) => {
        console.error("Erreur récupération produits :", err);
        setPopinMsg("Erreur chargement produits");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product: IProduct) => {
    if (!isAuthenticated || !user) {
      setPopinMsg("Veuillez vous connecter pour ajouter un produit.");
      return;
    }

    if (Number(product.stock) <= 0) {
      setPopinMsg("Produit indisponible.");
      return;
    }

    setAddingToCart(product.id);

    try {
      let cartId: number;

      if (!firstCart) {
        const fakeCart = {
          id: Date.now(),
          userId: user.id,
          createdAt: new Date().toISOString(),
          items: [
            {
              id: Date.now(),
              productId: product.id,
              product,
              quantity: 1,
            },
          ],
        };
        setCarts([fakeCart]);

        const res = await api.post("/carts", {
          userId: user.id,
          items: [{ productId: product.id, quantity: 1 }],
        });
        cartId = res.data.id;
        await fetchCart();
      } else {
        cartId = firstCart.id;

        setCarts((prev) =>
          prev.map((cart) =>
            cart.id === cartId
              ? {
                  ...cart,
                  items: cart.items.some((i) => i.product.id === product.id)
                    ? cart.items.map((i) =>
                        i.product.id === product.id
                          ? { ...i, quantity: i.quantity + 1 }
                          : i
                      )
                    : [
                        ...cart.items,
                        {
                          id: Date.now(),
                          productId: product.id,
                          product,
                          quantity: 1,
                        },
                      ],
                }
              : cart
          )
        );

        await api.patch(`/carts/users/me/${cartId}`, {
          items: [{ productId: product.id, quantity: 1 }],
        });
      }

      setPopinMsg("Produit ajouté au panier !");
    } catch (err) {
      console.error("Erreur ajout panier :", err);
      setPopinMsg("Impossible d’ajouter au panier.");
      await fetchCart();
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  const displayed = products.slice(0, 3);

  const bgVariants = [
    "bg-[#fef5e7]",
    "bg-[#fbe8d3]",
    "bg-[#f5e0dc]",
    "bg-[#f3e7d3]",
    "bg-[#f6ede2]",
  ];

  return (
    <div className="py-16 px-1 sm:px-2 lg:px-3 bg-white font-sans">
      <style>{`
        @keyframes floatY { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
        @keyframes slowRotate { 0% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } 100% { transform: rotate(0deg); } }
        @keyframes popScale { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }

        .anim-float { animation: floatY 3.6s ease-in-out infinite; }
        .anim-rotate { animation: slowRotate 4.2s ease-in-out infinite; }
        .anim-pop { animation: popScale 2.8s ease-in-out infinite; }

        .anim-slow { animation-duration: 5s; }
        .anim-fast { animation-duration: 2.6s; }

        @media (prefers-reduced-motion: reduce) {
          .anim-float, .anim-rotate, .anim-pop { animation: none !important; transform: none !important; }
        }
      `}</style>

      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      <div className="w-full mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <AnimatedIcon
            title="Fleur"
            className="anim-float anim-slow"
            delay="0s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="M4.9 4.9l2.8 2.8" />
              <path d="M16.3 16.3l2.8 2.8" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <circle cx="12" cy="12" r="2.6" fill="#fff4" />
            </svg>
          </AnimatedIcon>

          <AnimatedIcon
            title="Fioles"
            className="anim-rotate anim-slow"
            delay="0.15s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#db2777"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2h8" />
              <path d="M10 2v6" />
              <path d="M14 2v6" />
              <path d="M7 8v2c0 2.2 1 4 2.5 5.2L12 18l2.5-2.8C16 14 17 12.2 17 10V8" />
              <path d="M9 22h6" />
            </svg>
          </AnimatedIcon>

          <AnimatedIcon
            title="Pinceau"
            className="anim-pop anim-fast"
            delay="0.28s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 22s4-1 6-4c.7-.9 1-2 1-3 0-1.2-.5-2.2-1-3C7 10 10 6 14 2l3 3c-4 4-8 7-9 9-.5 1-.9 2-1 3-2 3-6 4-6 4z" />
            </svg>
          </AnimatedIcon>

          <AnimatedIcon
            title="Feuille"
            className="anim-float anim-fast"
            delay="0.42s"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#84cc16"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11s-3-7-11-9C7 1 3 6 3 11c0 5 4 9 9 9 5 0 9-4 9-9z" />
              <path d="M8 13c2-2 6-3 10-3" />
            </svg>
          </AnimatedIcon>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Nos Produits
          </h2>
          <p className="text-gray-500 mt-2 mb-6 text-sm sm:text-base">
            Commandez pour vous ou vos proches
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayed.map((product, idx) => {
            const isOutOfStock = Number(product.stock) <= 0;
            const bg = bgVariants[idx % bgVariants.length];

            return (
              <article
                key={product.id}
                // groupe pour targeter hover sur l'image + lift + z-index
                className="group relative w-full flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-visible transition-transform duration-300 hover:-translate-y-2 hover:shadow-3xl hover:z-10"
              >
                {/* IMAGE BLOCK - allow overflow so image can get much bigger */}
                <div
                  className={`w-full h-[420px] sm:h-[460px] md:h-96 flex items-center justify-center ${bg} overflow-visible`}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="w-full h-full flex items-center justify-center px-4"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      /* largeur normale mais en hover on l'agrandit fortement (scale 1.5)
                         et on la recentre. max-w-none permet au scale de s'exprimer pleinement. */
                      className="w-11/12 sm:w-10/12 md:w-9/12 lg:w-8/12 max-w-none h-auto object-contain block transform transition-all duration-500 ease-out
                                 group-hover:scale-150 group-hover:-translate-y-4"
                      style={{
                        mixBlendMode: "multiply",
                        background: "transparent",
                      }}
                    />
                  </Link>
                </div>

                {/* CARD BODY (padding) */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-3 line-clamp-2">
                        {product.name}
                      </h3>

                      <p
                        className="text-sm sm:text-base text-slate-600 mt-1 min-h-[4rem] line-clamp-3"
                        aria-label={product.description}
                      >
                        {truncateText(product.description, 160)}
                      </p>
                    </Link>
                  </div>

                  <div className="mt-6">
                    <div className="mb-4 flex items-center justify-center">
                      {isOutOfStock && (
                        <span className="inline-block px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                          Indisponible
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      {!isOutOfStock ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="inline-block px-10 py-3 rounded-full bg-gray-900 text-white text-base sm:text-lg font-semibold hover:opacity-95 transition"
                        >
                          Ajouter au panier
                        </button>
                      ) : (
                        <div style={{ height: 52 }} />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Product;
