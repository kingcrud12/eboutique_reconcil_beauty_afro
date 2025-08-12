import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

type OrderItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
};

type Order = {
  id: number;
  total: number;
  status: string;
  deliveryMode?: string;
  deliveryAddress?: string;
  createdAt?: string;
  items: OrderItem[];
};

function formatDate(input?: string) {
  if (!input) return "-";
  const d = new Date(input);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString("fr-FR");
}

function formatMoney(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    pending: "En cours",
    paid: "Payé",
    canceled: "Annulé",
    cancelled: "Annulé",
    shipped: "Expédié",
    delivered: "Livré",
  };
  return map[status.toLowerCase()] || status;
}

function translateDelivery(mode?: string) {
  const map: Record<string, string> = {
    HOME: "Standard",
    RELAY: "Point relais",
    EXPRESS: "Express",
  };
  return mode ? map[mode.toUpperCase()] || mode : "-";
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api
      .get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!order) return <div className="p-6 text-red-600">Commande introuvable</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Détails de la commande {order.id}</h2>
      <p>Date : {formatDate(order.createdAt)}</p>
      <p>Statut : {translateStatus(order.status)}</p>
      <p>Mode de livraison : {translateDelivery(order.deliveryMode)}</p>
      <p>Adresse de livraison : {order.deliveryAddress || "—"}</p>

      <h3 className="text-xl font-semibold mt-6">Articles commandés</h3>
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            {item.product.imageUrl && (
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p>Quantité : {item.quantity}</p>
              <p>Prix unitaire : {formatMoney(item.product.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 text-lg font-bold">
        Total : {formatMoney(order.total)}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-800 text-white rounded"
      >
        ⬅ Retour
      </button>
    </div>
  );
}
