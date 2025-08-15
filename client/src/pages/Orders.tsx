import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name?: string;
  imageUrl?: string;
  price?: number | string;
}
interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  product?: Product;
}
interface Order {
  id: number;
  total: number | string;
  status: "pending" | "paid" | string;
  deliveryAddress: string;
  deliveryMode: string;
  items: OrderItem[];
}
interface User { id: number; }

// Traduction statut
  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "Payé";
      case "pending":
        return "En cours";
      default:
        return status;
    }
  };

  // Traduction mode de livraison
  const translateDeliveryMode = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "home":
        return "Livraison à domicile standard";
      case "express":
        return "Livraison à domicile express";
      case "relay":
          return "Livraison en point relais";
      default:
        return mode;
    }
  };


function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<number | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  // 🔽 état modal Produits
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (uid: number) => {
    const res = await api.get<Order[]>(`/order/user/${uid}`);
    setOrders(res.data ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const me = await api.get<User>("/user/me");
        setMeId(me.data.id);
        await fetchOrders(me.data.id);
      } catch (e) {
        console.error("Erreur récupération commandes :", e);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, fetchOrders]);

  const handlePay = async (orderId: number, status: string) => {
    if (status !== "pending" || payingOrderId) return;

    try {
      setPayingOrderId(orderId);

      await api.post("/payments/intent", {
        orderId,
        userId: meId ?? 1,
      });

      const checkoutRes = await api.post(`/payments/checkout/${orderId}`);
      const checkoutUrl =
        typeof checkoutRes.data === "string"
          ? checkoutRes.data
          : checkoutRes.data?.url;

      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        throw new Error("URL de paiement introuvable.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Erreur paiement :", err);
      alert("Impossible d'initier le paiement pour le moment. Merci de réessayer.");
      setPayingOrderId(null);
    }
  };

  // 👉 ouvre la modal Produits pour une commande NON payée
  const handleEdit = async (orderId: number, status: string) => {
    if (String(status).toLowerCase() === "paid") return; // prot UI
    try {
      setError(null);
      const res = await api.get<Product[]>("/products");
      setProducts(res.data ?? []);
      setSelectedOrderId(orderId);
      setProductsModalOpen(true);
    } catch (e) {
      console.error("Erreur chargement produits", e);
      setError("Impossible de charger les produits.");
    }
  };

  // ✅ aligne sur PATCH /order/:id?userId=ME  body: { items: [{ productId, quantity: 1 }] }
  const handleAddProductToOrder = async (productId: number) => {
    if (!selectedOrderId || !meId) return;
    try {
      setAddingProductId(productId);

      await api.patch(
        `/order/${selectedOrderId}`,
        { items: [{ productId, quantity: 1 }] },
        { params: { userId: meId } } // ← query param requis par le back
      );

      // rafraîchit les commandes
      await fetchOrders(meId);

      // ferme la modal
      setProductsModalOpen(false);
      setSelectedOrderId(null);
    } catch (e) {
      console.error("Erreur ajout produit à la commande :", e);
      alert("Impossible d’ajouter l’article à la commande.");
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) return <p className="p-6 text-center">Chargement...</p>;

  if (!orders.length) {
    return (
      <div className="p-6 text-center mt-[150px]">
        <p>Aucune commande trouvée.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto mt-[150px] space-y-8">
      <h1 className="text-2xl font-bold">Mes commandes</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {orders.map((order) => {
        const orderTotal = Number(order.total);
        const isPending = String(order.status).toLowerCase() === "pending";
        const isPaid = String(order.status).toLowerCase() === "paid";
        const isPaying = payingOrderId === order.id;

        return (
          <div
            key={order.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Commande {order.id}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isPending
                      ? "bg-yellow-100 text-yellow-700"
                      : isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {translateStatus(order.status)}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                {translateDeliveryMode(order.deliveryMode)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePay(order.id, order.status)}
                  disabled={!isPending || isPaying}
                  className={`px-3 py-2 rounded text-white text-sm transition
                    ${
                      isPending && !isPaying
                        ? "bg-black hover:bg-gray-800"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  title={
                    isPending
                      ? "Procéder au paiement"
                      : "Le paiement n’est possible que pour les commandes en attente"
                  }
                >
                  {isPaying ? "Redirection..." : "Payer"}
                </button>

                <button
                  onClick={() => handleEdit(order.id, order.status)}
                  disabled={isPaid}
                  title={
                    isPaid
                      ? "Commande payée — modification désactivée"
                      : "Modifier la commande"
                  }
                  className={`px-3 py-2 rounded border text-sm ${
                    isPaid ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  }`}
                >
                  Modifier
                </button>
              </div>
            </div>

            <p className="mb-3 text-sm text-gray-600">
              📦 Livraison : {order.deliveryAddress}
            </p>

            <ul className="space-y-3">
              {order.items.map((it) => {
                const p = it.product;
                const unit = Number(it.unitPrice);
                const lineTotal = (unit * it.quantity).toFixed(2);

                return (
                  <li key={it.id} className="flex items-center gap-4">
                    {p?.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p?.name ?? `Produit #${it.productId}`}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 grid place-items-center text-xs text-gray-600">
                        N/A
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="font-medium">
                        {p?.name ?? `Produit #${it.productId}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantité : {it.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">{lineTotal} €</p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 font-bold text-right">
              Total : {isNaN(orderTotal) ? "-" : orderTotal.toFixed(2)} €
            </div>
          </div>
        );
      })}

      {/* Modal Produits */}
      {productsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => {
                setProductsModalOpen(false);
                setSelectedOrderId(null);
              }}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">
              Ajouter un produit à la commande #{selectedOrderId}
            </h3>

            {products.length === 0 ? (
              <p className="text-sm text-gray-600">Aucun produit disponible.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddProductToOrder(p.id)}
                    className="border rounded p-2 cursor-pointer hover:shadow transition"
                    title="Ajouter ce produit"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-24 mx-auto mb-2 object-contain"
                    />
                    <p className="text-center text-sm font-medium">{p.name}</p>
                    <p className="text-center text-xs text-gray-500">
                      {typeof p.price === "number" ? p.price.toFixed(2) : p.price} €
                    </p>
                    {addingProductId === p.id && (
                      <p className="text-xs text-center text-blue-600 mt-1">
                        Ajout…
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setProductsModalOpen(false);
                  setSelectedOrderId(null);
                }}
                className="px-4 py-2 rounded border"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
