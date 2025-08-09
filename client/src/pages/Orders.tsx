import React, { useEffect, useState } from "react";
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
  status: string;
  deliveryAddress: string;
  items: OrderItem[];
}

interface User {
  id: number;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<User>("/user/me");
        const res = await api.get<Order[]>(`/order/${me.data.id}`);
        setOrders(res.data ?? []);
      } catch (e) {
        console.error("Erreur récupération commandes :", e);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handlePay = (orderId: number, status: string) => {
    if (status !== "pending") return;
    // À brancher plus tard (ex: /payment/:id ou ouverture de checkout)
    // navigate(`/payment/${orderId}`);
    alert(`Paiement de la commande #${orderId} (à implémenter)`);
  };

  const handleEdit = (orderId: number) => {
    // À brancher plus tard (ex: page d’édition d’adresse)
    // navigate(`/orders/${orderId}/edit`);
    alert(`Modification de la commande #${orderId} (à implémenter)`);
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

      {orders.map((order) => {
        const orderTotal = Number(order.total);
        const isPending = order.status === "pending";

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
                      : order.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePay(order.id, order.status)}
                  disabled={!isPending}
                  className={`px-3 py-2 rounded text-white text-sm transition
                    ${
                      isPending
                        ? "bg-black hover:bg-gray-800"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  title={
                    isPending
                      ? "Procéder au paiement"
                      : "Le paiement n’est possible que pour les commandes en attente"
                  }
                >
                  Payer
                </button>
                <button
                  onClick={() => handleEdit(order.id)}
                  className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
                  title="Modifier la commande"
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
    </div>
  );
}

export default Orders;
