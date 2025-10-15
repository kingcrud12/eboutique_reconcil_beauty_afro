/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Popin from "../components/Popin";
import ProductIcons from "./ProductIcons";

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

  const navigate = useNavigate();
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // détecte support tactile
    const touch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouch(Boolean(touch));
  }, []);

  useEffect(() => {
    // Définir les IDs des produits à récupérer
    const productIds = [1, 14, 6]; // IDs spécifiés

    // Utiliser Promise.all pour récupérer plusieurs produits par leur ID
    Promise.all(
      productIds.map((id) =>
        api
          .get(`/products/${id}`)
          .then((res) => res.data)
          .catch((err) => {
            console.error(`Erreur récupération produit ${id} :`, err);
            setPopinMsg("Erreur chargement produit");
          })
      )
    )
      .then((productsData) => setProducts(productsData)) // Mettre à jour les produits dans le state
      .finally(() => setLoading(false)); // Terminer le chargement
  }, []);

  // close active zoom when tapping outside or on scroll/resize
  useEffect(() => {
    function onDocTouch(e: TouchEvent | Event) {
      if (!containerRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!containerRef.current.contains(e.target)) {
        setActiveProductId(null);
      }
    }
    function onScroll() {
      setActiveProductId(null);
    }
    window.addEventListener("touchstart", onDocTouch, { passive: true });
    window.addEventListener("mousedown", onDocTouch);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("touchstart", onDocTouch);
      window.removeEventListener("mousedown", onDocTouch);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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

  // click handler for touch: first tap zooms, second tap navigates
  const handleImageClickOnTouch = (
    e: React.MouseEvent | React.TouchEvent,
    productId: number,
    productPath: string
  ) => {
    if (!isTouch) return; // let default on desktop
    // If already active -> navigate
    if (activeProductId === productId) {
      setActiveProductId(null);
      navigate(productPath);
      return;
    }
    // otherwise activate zoom and prevent navigation
    e.preventDefault();
    setActiveProductId(productId);
  };

  return (
    <div
      ref={containerRef}
      className="py-16 px-1 sm:px-2 lg:px-3 bg-white font-sans"
    >
      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      <div className="w-full mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {/* Animated Icons */}
        </div>

        <div className="text-center mb-8">
          <ProductIcons />
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
            const isMiddle = idx === 1; // Carte du milieu
            const isActive = activeProductId === product.id;

            return (
              <article
                key={product.id}
                className={`group relative w-full flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl transition-transform duration-300 ${
                  isActive
                    ? "z-50 -translate-y-2 shadow-2xl"
                    : "hover:-translate-y-2 hover:z-10"
                }`}
              >
                {/* IMAGE BLOCK */}
                <div
                  className={`w-full h-[420px] sm:h-[460px] md:h-96 flex items-center justify-center ${
                    isMiddle ? "bg-white" : ""
                  } overflow-visible`}
                >
                  <Link
                    to={`/product/${product.id}`}
                    onClick={(e) => {
                      if (isTouch) {
                        handleImageClickOnTouch(
                          e as any,
                          product.id,
                          `/product/${product.id}`
                        );
                      }
                    }}
                    className="w-full h-full flex items-center justify-center px-4"
                    aria-label={`Voir ${product.name}`}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className={`w-11/12 sm:w-10/12 md:w-9/12 lg:w-8/12 max-w-none h-auto object-contain block desktop-img ${
                        isActive ? "mobile-active" : ""
                      }`}
                      style={{
                        mixBlendMode: "multiply", // Mélange l'image avec le fond
                        background: "transparent", // Supprime le fond blanc de l'image
                      }}
                    />
                  </Link>
                </div>

                {/* CARD BODY */}
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
                        <Link to="/products">
                          <button className="inline-block px-10 py-3 rounded-full bg-green-600 text-white text-base sm:text-lg font-semibold hover:opacity-95 transition">
                            Découvrir
                          </button>
                        </Link>
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
