import React, { useEffect, useState } from "react";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Popin from "../components/Popin";

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
      .then((res) => setProducts(res.data))
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

    // bloquer si rupture
    if (Number(product.stock) <= 0) {
      setPopinMsg("Produit indisponible.");
      return;
    }

    setAddingToCart(product.id);

    try {
      let cartId: number;

      if (!firstCart) {
        // 🟢 Création optimiste d’un nouveau panier
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
        setCarts([fakeCart]); // optimiste

        const res = await api.post("/carts", {
          userId: user.id,
          items: [{ productId: product.id, quantity: 1 }],
        });
        cartId = res.data.id;
        await fetchCart(); // réalignement
      } else {
        cartId = firstCart.id;

        // 🟢 Incrément optimiste
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
                          id: Date.now(), // fake id temporaire
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
      await fetchCart(); // rollback
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-sans">
      {popinMsg && (
        <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />
      )}

      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Nos Produits
        </h2>
        <p className="text-gray-500 mt-2 mb-10 text-sm sm:text-base">
          Commandez pour vous ou vos proches
        </p>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isOutOfStock = Number(product.stock) <= 0;
            const isAdding = addingToCart === product.id;
            const disabledButton = isAdding || isOutOfStock;

            return (
              <div
                key={product.id}
                className="bg-white max-w-xs w-full mx-auto p-4 rounded-xl shadow hover:shadow-md flex flex-col justify-between text-center h-full"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-32 sm:h-40 object-contain mb-4"
                  />
                  <Link to={`/product/${product.id}`} className="w-full">
                    <h3 className="font-semibold text-gray-800 mb-2 h-[60px]">
                      {product.name.slice(0, 60)}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-3 min-h-[60px]">
                      {product.description.slice(0, 120)}…
                    </p>

                    {/* PRICE HIDDEN - nothing shown here */}
                  </Link>

                  {/* Out of stock badge */}
                  {isOutOfStock && (
                    <p className="mt-3 inline-block px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                      Article indisponible
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={disabledButton}
                  className={`mt-4 px-4 py-2 text-white rounded ${
                    disabledButton
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                >
                  {isOutOfStock
                    ? "Indisponible"
                    : isAdding
                    ? "Ajout..."
                    : "Ajouter au panier"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Product;
