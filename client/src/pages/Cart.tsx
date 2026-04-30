import React, { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { useAuth } from "../contexts/AuthContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

function Cart() {
  const { carts, fetchCart, setCarts, fetchGuestCart, updateGuestCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const GUEST_STORAGE_KEY = "guest_cart_uuid";

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [confirmDeleteCartId, setConfirmDeleteCartId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (isAuthenticated) {
          const guestUuid = localStorage.getItem(GUEST_STORAGE_KEY);
          if (guestUuid) {
            const me = await api.get<{ id: number }>("/users/me");
            await updateGuestCart({ userId: me.data.id });
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
          await fetchCart();
        } else {
          await fetchGuestCart();
        }
      } catch (error) { console.error("Erreur chargement panier:", error); }
      finally { setLoading(false); }
    };
    loadCart();
  }, [fetchCart, fetchGuestCart, isAuthenticated, updateGuestCart]);

  const handleAddOne = (cartId: number, productId: number) => {
    setCarts((prev) => prev.map((cart) => cart.id === cartId ? { ...cart, items: cart.items.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i) } : cart));
    if (isAuthenticated) {
      api.patch(`/carts/users/me/${cartId}`, { items: [{ productId, quantity: 1 }] }).catch(() => fetchCart());
    } else {
      updateGuestCart({ items: [{ productId, quantity: 1 }] }).catch(() => fetchGuestCart());
    }
  };

  const handleRemoveOne = (cartId: number, productId: number) => {
    setCarts((prev) => prev.map((cart) => cart.id === cartId ? { ...cart, items: cart.items.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i).filter((i) => i.quantity > 0) } : cart).filter((cart) => cart.items.length > 0));
    if (isAuthenticated) {
      api.patch(`/carts/users/me/${cartId}`, { items: [{ productId, quantity: -1 }] }).catch(() => fetchCart());
    } else {
      updateGuestCart({ items: [{ productId, quantity: -1 }] }).catch(() => fetchGuestCart());
    }
  };

  const openModal = async (cartId: number) => {
    try {
      const res = await api.get("/products");
      setProducts(res.data); setSelectedCartId(cartId); setModalOpen(true);
    } catch (error) { console.error("Erreur chargement produits", error); }
  };

  const handleAddProduct = async (productId: number) => {
    if (!selectedCartId) return;
    try {
      setAddingProductId(productId);
      if (isAuthenticated) {
        await api.patch(`/carts/users/me/${selectedCartId}`, { items: [{ productId, quantity: 1 }] });
        await fetchCart();
      } else {
        await fetchGuestCart();
        if (!carts.length) { alert("Votre panier invité a été supprimé."); }
        else { await updateGuestCart({ items: [{ productId, quantity: 1 }] }); await fetchGuestCart(); }
      }
      setModalOpen(false);
    } catch (error) { console.error("Erreur ajout produit", error); alert("Impossible d'ajouter l'article."); }
    finally { setAddingProductId(null); }
  };

  const confirmDeleteCart = async () => {
    if (!confirmDeleteCartId) return;
    try {
      if (isAuthenticated) { await api.delete(`/carts/users/me/${confirmDeleteCartId}`); await fetchCart(); }
      else { setCarts((prev) => prev.filter((c) => c.id !== confirmDeleteCartId)); }
      setConfirmDeleteCartId(null);
    } catch (error) { console.error("Erreur suppression panier", error); }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Chargement...</p>
    </div>
  );

  const activeCarts = carts.filter(cart => cart.items.length > 0);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-8">Mon Panier</h1>

      {activeCarts.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Votre panier est vide</p>
          <p className="text-gray-400 text-sm mb-6">Ajoutez des produits pour les voir apparaître ici</p>
          <button onClick={() => navigate("/products")} className="px-6 py-2.5 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {activeCarts.map((cart, idx) => (
            <div key={cart.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Panier {idx + 1}</h2>
                {isAuthenticated && (
                  <button onClick={() => setConfirmDeleteCartId(cart.id)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                )}
              </div>

              <ul className="divide-y divide-gray-50">
                {cart.items.map((item) => (
                  <li key={item.id} className="p-4 flex items-center gap-4">
                    <img src={item.product.imageUrl} alt={item.product.name}
                      className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1" style={{ mixBlendMode: "multiply" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{Number(item.product.price).toFixed(2)}€ / unité</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRemoveOne(cart.id, item.product.id)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold text-gray-800 w-6 text-center">{item.quantity}</span>
                      <button onClick={() => handleAddOne(cart.id, item.product.id)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-800 w-20 text-right">
                      {(Number(item.product.price) * item.quantity).toFixed(2)}€
                    </p>
                  </li>
                ))}
              </ul>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                <button onClick={() => openModal(cart.id)} className="text-sm text-sage-600 font-medium hover:text-sage-700 transition-colors">
                  + Ajouter des articles
                </button>
                <button onClick={() => isAuthenticated ? navigate("/delivery") : setShowAuthModal(true)}
                  className="px-6 py-2.5 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors">
                  Valider le panier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Produits */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setModalOpen(false)}>✕</button>
            <h3 className="text-lg font-serif font-bold mb-4 text-gray-800">Ajouter un produit</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {products.map((p) => (
                <div key={p.id} onClick={() => handleAddProduct(p.id)}
                  className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:border-sage-300 hover:shadow-sm transition">
                  <img src={p.imageUrl} alt={p.name} className="h-20 mx-auto mb-2 object-contain" style={{ mixBlendMode: "multiply" }} />
                  <p className="text-center text-xs font-medium text-gray-800">{p.name}</p>
                  <p className="text-center text-xs text-gray-400">{p.price} €</p>
                  {addingProductId === p.id && <p className="text-xs text-center text-sage-600 mt-1">Ajout…</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmDeleteCartId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-serif font-semibold mb-3">Supprimer le panier ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteCartId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Annuler</button>
              <button onClick={confirmDeleteCart} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal connexion */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-base font-serif font-semibold mb-2">Connexion requise</h3>
            <p className="text-sm text-gray-500 mb-5">Connectez-vous pour valider votre panier.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => navigate("/login", { state: { fromCart: true } })} className="px-5 py-2 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700">Se connecter</button>
              <button onClick={() => setShowAuthModal(false)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
