// src/components/FeaturedProducts.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Popin from "./Popin";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);

  const { fetchCart, firstCart, setCarts } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let mounted = true;
    api
      .get("/products")
      .then((res) => {
        if (mounted) setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Erreur récupération produits :", err);
        setPopinMsg("Erreur lors du chargement des produits.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = async (product: IProduct) => {
    if (!isAuthenticated || !user) {
      setPopinMsg("Veuillez vous connecter pour ajouter un produit.");
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
      setPopinMsg("Impossible d’ajouter le produit au panier.");
      await fetchCart();
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  return (
    <section className="py-20 bg-white">
      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nos produits phares
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une sélection de produits naturels et efficaces pour tous types de
            cheveux afro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
            >
              {/* Conteneur image responsive */}
              <div className="overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 md:h-56 lg:h-64 object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/product/${product.id}`} className="w-full">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 h-[60px] overflow-hidden">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-3 min-h-[60px]">
                      {product.description?.slice(0, 120)}
                      {product.description && product.description.length > 120
                        ? "…"
                        : ""}
                    </p>
                  </Link>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-600">
                    {parseFloat(product.price.replace(",", ".")).toFixed(2) +
                      "€"}
                  </span>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart === product.id}
                    className={`ml-4 px-4 py-2 text-white rounded ${
                      addingToCart === product.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-teal-600 hover:bg-teal-700"
                    }`}
                  >
                    {addingToCart === product.id ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              Aucun produit disponible pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
