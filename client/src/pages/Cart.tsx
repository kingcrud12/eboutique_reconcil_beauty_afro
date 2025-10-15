import React, { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { useAuth } from "../contexts/AuthContext";

function Cart() {
  const {
    carts,
    fetchCart,
    setCarts,
    fetchGuestCart,
    updateGuestCart,
  } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const GUEST_STORAGE_KEY = "guest_cart_uuid";

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [confirmDeleteCartId, setConfirmDeleteCartId] = useState<number | null>(
    null
  );
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (isAuthenticated) {
          // Si un panier invité existe, le réconcilier avec l'utilisateur connecté
          const guestUuid = localStorage.getItem(GUEST_STORAGE_KEY);
          if (guestUuid) {
            // Récupérer l'utilisateur connecté
            const me = await api.get<{ id: number }>("/users/me");
            // PATCH du panier invité pour l'associer à l'userId
            // NB: côté API, il faudra que PATCH /carts/{uuid} accepte userId
            await updateGuestCart({ userId: me.data.id });
            // Nettoyer l'UUID invité
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
          await fetchCart();
        } else {
          await fetchGuestCart();
        }
      } catch (error) {
        console.error("Erreur chargement panier:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [fetchCart, fetchGuestCart, isAuthenticated, updateGuestCart]);

  // Incrément optimiste
  const handleAddOne = (cartId: number, productId: number) => {
    setCarts((prev) =>
      prev.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              items: cart.items.map((i) =>
                i.product.id === productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          : cart
      )
    );

    if (isAuthenticated) {
      api
        .patch(`/carts/users/me/${cartId}`, {
          items: [{ productId, quantity: 1 }],
        })
        .catch((err) => {
          console.error("Erreur incrément :", err);
          fetchCart();
        });
    } else {
      updateGuestCart({ items: [{ productId, quantity: 1 }] }).catch((err) => {
        console.error("Erreur incrément (guest) :", err);
        fetchGuestCart();
      });
    }
  };

  // Décrément optimiste
  const handleRemoveOne = (cartId: number, productId: number) => {
    setCarts((prev) =>
      prev.map((cart) =>
        cart.id === cartId
          ? {
              ...cart,
              items: cart.items
                .map((i) =>
                  i.product.id === productId
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
                )
                .filter((i) => i.quantity > 0),
            }
          : cart
      )
    );

    if (isAuthenticated) {
      api
        .patch(`/carts/users/me/${cartId}`, {
          items: [{ productId, quantity: -1 }],
        })
        .catch((err) => {
          console.error("Erreur décrément :", err);
          fetchCart();
        });
    } else {
      updateGuestCart({ items: [{ productId, quantity: -1 }] }).catch(
        (err) => {
          console.error("Erreur décrément (guest) :", err);
          fetchGuestCart();
        }
      );
    }
  };

  const openModal = async (cartId: number) => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      setSelectedCartId(cartId);
      setModalOpen(true);
    } catch (error) {
      console.error("Erreur chargement produits", error);
    }
  };

  const handleAddProduct = async (productId: number) => {
    if (!selectedCartId) return;
    try {
      setAddingProductId(productId);
      if (isAuthenticated) {
        await api.patch(`/carts/users/me/${selectedCartId}`, {
          items: [{ productId, quantity: 1 }],
        });
        await fetchCart();
      } else {
        // Invité: vérifier existence via GET avant toute écriture
        await fetchGuestCart();
        if (!carts.length) {
          // Pas de panier côté serveur: ne pas POST/PATCH
          alert("Votre panier invité a été supprimé. Rafraîchissez la page.");
        } else {
          await updateGuestCart({ items: [{ productId, quantity: 1 }] });
          await fetchGuestCart();
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Erreur ajout produit", error);
      alert("Impossible d’ajouter l’article.");
    } finally {
      setAddingProductId(null);
    }
  };

  const confirmDeleteCart = async () => {
    if (!confirmDeleteCartId) return;
    try {
      if (isAuthenticated) {
        await api.delete(`/carts/users/me/${confirmDeleteCartId}`);
        await fetchCart();
      } else {
        // Pour les invités, on vide le panier en local (pas de route DELETE définie)
        setCarts((prev) =>
          prev.map((c) =>
            c.id === confirmDeleteCartId ? { ...c, items: [] } : c
          )
        );
        await fetchGuestCart();
      }
      setConfirmDeleteCartId(null);
    } catch (error) {
      console.error("Erreur suppression panier", error);
    }
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto mt-[120px]">
      <h1
        className={`text-2xl font-bold ${
          carts.length === 0 ? "mb-[280px]" : "mb-8"
        }`}
      >
        🛒 Vos Paniers
      </h1>

      <div className="space-y-6">
        {carts.map((cart, idx) => (
          <div key={cart.id} className="border rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Panier {idx + 1}</h2>
              {isAuthenticated && (
                <button
                  onClick={() => setConfirmDeleteCartId(cart.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer le panier
                </button>
              )}
            </div>

            {cart.items.length === 0 ? (
              <p className="text-gray-500">Ce panier est vide.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <li
                    key={item.id}
                    className="py-4 flex items-center space-x-4"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantité : {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleRemoveOne(cart.id, item.product.id)
                        }
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                      >
                        −
                      </button>
                      <button
                        onClick={() => handleAddOne(cart.id, item.product.id)}
                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => openModal(cart.id)}
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Ajouter des articles
              </button>
              <button
                onClick={() =>
                  isAuthenticated ? navigate("/delivery") : setShowAuthModal(true)
                }
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Valider le panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Produits */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">
              Ajouter un produit au panier
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddProduct(p.id)}
                  className="border rounded p-2 cursor-pointer hover:shadow transition"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-24 mx-auto mb-2 object-contain"
                  />
                  <p className="text-center text-sm font-medium">{p.name}</p>
                  <p className="text-center text-xs text-gray-500">
                    {p.price} €
                  </p>
                  {addingProductId === p.id && (
                    <p className="text-xs text-center text-blue-600 mt-1">
                      Ajout...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression panier */}
      {confirmDeleteCartId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer ce panier ?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDeleteCartId(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Non
              </button>
              <button
                onClick={confirmDeleteCart}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal demande de connexion pour invités lors de la validation */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
            <p className="text-sm text-gray-700 mb-6">
              Veuillez vous connecter pour continuer la validation du panier.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
