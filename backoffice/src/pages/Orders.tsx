import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import api from "../api/api";

type DeliveryMode = "RELAY" | "HOME" | "EXPRESS" | string;

type Order = {
  id: number;
  total: number | string;
  status: string;
  createdAt?: string | Date;
  deliveryMode?: DeliveryMode;
  deliveryAddress: string;
  userId?: number;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

const orderColumns = [
  { label: "ID Commande", field: "id" },
  { label: "Nom du client", field: "clientName" },
  { label: "Email", field: "email" },
  { label: "Date de commande", field: "date" },
  { label: "Statut", field: "status" },
  { label: "Montant total", field: "total" },
  { label: "Mode de livraison", field: "deliveryMode" },
  { label: "Adresse de livraison", field: "address" },
  { label: "Actions", field: "actions" }, // 👈 nouveau
];

function formatDate(input?: string | Date) {
  if (!input) return "-";
  const d = new Date(input);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function formatMoney(val: number | string) {
  const n = typeof val === "number" ? val : Number(val);
  if (!isFinite(n)) return "-";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

// Traduction du mode de livraison
function labelDelivery(mode?: DeliveryMode) {
  switch (mode) {
    case "HOME":
      return "Standard";
    case "RELAY":
      return "Point relais";
    case "EXPRESS":
      return "Express";
    default:
      return mode || "-";
  }
}

// Pastille colorée + traduction pour les statuts
function renderStatus(status: string) {
  const key = String(status || "").toLowerCase();
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-emerald-100 text-emerald-800",
  };

  const translations: Record<string, string> = {
    pending: "En cours",
    paid: "Payé",
    canceled: "Annulé",
    cancelled: "Annulé",
    shipped: "Expédié",
    delivered: "Livré",
  };

  const cls = colors[key] || "bg-gray-100 text-gray-800";
  const translated = translations[key] || status;

  return <span className={`px-2 py-1 text-xs font-semibold rounded ${cls}`}>{translated}</span>;
}

// Pastille colorée pour les modes de livraison
function renderDelivery(mode?: DeliveryMode) {
  const map: Record<string, string> = {
    HOME: "bg-purple-100 text-purple-800",
    RELAY: "bg-indigo-100 text-indigo-800",
    EXPRESS: "bg-pink-100 text-pink-800",
  };
  const cls = map[String(mode || "").toUpperCase()] || "bg-gray-100 text-gray-800";
  return <span className={`px-2 py-1 text-xs font-semibold rounded ${cls}`}>{labelDelivery(mode)}</span>;
}

export default function Orders() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [ordersRes, usersRes] = await Promise.all([
          api.get<Order[]>("/orders"),
          api.get<User[]>("/users"),
        ]);

        const orders = ordersRes.data ?? [];
        const users = usersRes.data ?? [];

        const userMap = new Map<number, User>();
        users.forEach((u) => userMap.set(u.id, u));

        const mapped = orders.map((o) => {
          const user = o.userId ? userMap.get(o.userId) : undefined;
          return {
            // 👇 ID cliquable aussi
            id: (
              <Link
                to={`/orders/${o.id}`}
                className="text-black hover:underline"
                title={`Voir la commande #${o.id}`}
              >
                {o.id}
              </Link>
            ),
            clientName: user ? `${user.firstName} ${user.lastName}` : "—",
            email: user?.email || "—",
            date: formatDate(o.createdAt),
            status: renderStatus(o.status),
            total: formatMoney(o.total),
            deliveryMode: renderDelivery(o.deliveryMode),
            address: o.deliveryAddress || "—",
            actions: (
              <button
                onClick={() => navigate(`/orders/${o.id}`)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Voir détails
              </button>
            ),
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error("Erreur chargement des commandes :", e);
        setErr("Impossible de charger les commandes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6">
      <DataTable columns={orderColumns} data={rows} />
    </div>
  );
}
