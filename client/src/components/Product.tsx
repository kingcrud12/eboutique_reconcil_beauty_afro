/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { Link, useNavigate } from "react-router-dom";
import { createProductSlug } from "../utils/urlUtils";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Popin from "../components/Popin";
import ProductIcons from "./ProductIcons";
import { ArrowRight, Star } from "lucide-react";

function truncateText(text?: string | null, max = 80) {
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
    const touch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouch(Boolean(touch));
  }, []);

  useEffect(() => {
    const productIds = [1, 14, 6];
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
      .then((productsData) => {
        const validProducts = productsData.filter((p) => !!p);
        setProducts(validProducts);
      })
      .finally(() => setLoading(false));
  }, []);

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
      setPopinMsg("Impossible d'ajouter au panier.");
      await fetchCart();
    } finally {
      setAddingToCart(null);
    }
  };

  const handleImageClickOnTouch = (
    e: React.MouseEvent | React.TouchEvent,
    productId: number,
    productPath: string
  ) => {
    if (!isTouch) return;
    if (activeProductId === productId) {
      setActiveProductId(null);
      navigate(productPath);
      return;
    }
    e.preventDefault();
    setActiveProductId(productId);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Chargement des produits...</p>
      </div>
    );
  }

  const displayed = products.slice(0, 3);

  return (
    <div ref={containerRef} className="bg-white">
      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      {/* Values Bar + Ingredients */}
      <ProductIcons />

      {/* Section: Nos meilleures ventes */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800">
            Nos meilleures ventes
          </h2>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sage-600 font-medium text-sm hover:text-sage-700 transition-colors group"
          >
            Voir tous les produits
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((product) => {
            const isOutOfStock = Number(product.stock) <= 0;
            const isAdding = addingToCart === product.id;
            const productPath = `/product/${createProductSlug(product.id, product.name)}`;

            return (
              <article
                key={product.id}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Image */}
                <Link
                  to={productPath}
                  className="block w-full aspect-square bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="max-w-[75%] max-h-[75%] object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  {/* Badge */}
                  {!isOutOfStock && (
                    <span className="absolute top-3 left-3 bg-sage-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                      Bio
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      Épuisé
                    </span>
                  )}
                </Link>

                {/* Body */}
                <div className="p-4 sm:p-5">
                  <Link to={productPath}>
                    <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-sage-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-400 mb-2">{truncateText(product.description, 50)}</p>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">(127)</span>
                  </div>

                  {/* Price */}
                  <p className="text-lg font-bold text-gray-800 mb-4">
                    {Number(product.price).toFixed(2)}€
                  </p>

                  {/* CTA Button */}
                  {!isOutOfStock ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                        isAdding
                          ? "bg-gray-200 text-gray-500 cursor-wait"
                          : "bg-sage-600 text-white hover:bg-sage-700"
                      }`}
                    >
                      {isAdding ? "Ajout..." : "Ajouter au panier"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-lg font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                      Indisponible
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile: See all link */}
        <div className="sm:hidden text-center mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sage-600 font-medium text-sm group"
          >
            Voir tous les produits
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Product;
