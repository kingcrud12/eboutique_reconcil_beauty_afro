import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import api from "../api/api";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type Order = {
  id: number;
  userId?: number;
  createdAt?: string | Date;
};

const userColumns = [
  { label: "Nom", field: "lastName" },
  { label: "Prénom", field: "firstName" },
  { label: "Email", field: "email" },
  { label: "Date de création", field: "date" }, // Ici on va mettre la date de la dernière commande
  { label: "Dernière commande", field: "lastOrder" }
];

function formatDate(input?: string | Date) {
  if (!input) return "–";
  const d = new Date(input);
  return isNaN(d.getTime())
    ? "–"
    : d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function Customers() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [usersRes, ordersRes] = await Promise.all([
          api.get<User[]>("/users"),
          api.get<Order[]>("/orders"),
        ]);

        const users = usersRes.data ?? [];
        const orders = ordersRes.data ?? [];

        // On garde uniquement la dernière commande (max createdAt puis id)
        const lastOrderByUser = new Map<number, Order>();

        orders.forEach((o) => {
          if (!o.userId) return;
          const prevLast = lastOrderByUser.get(o.userId);
          const prevLastTs = prevLast?.createdAt ? new Date(prevLast.createdAt).getTime() : -Infinity;
          const currLastTs = o.createdAt ? new Date(o.createdAt).getTime() : -Infinity;

          if (
            !prevLast ||
            currLastTs > prevLastTs ||
            (currLastTs === prevLastTs && o.id > (prevLast?.id ?? 0))
          ) {
            lastOrderByUser.set(o.userId, o);
          }
        });

        const mapped = users.map((u) => {
          const lastOrder = lastOrderByUser.get(u.id);
          return {
            lastName: u.lastName,
            firstName: u.firstName,
            email: u.email,
            date: lastOrder ? formatDate(lastOrder.createdAt) : "–", // ✅ Date = date de la dernière commande
            lastOrder: lastOrder ? String(lastOrder.id) : "–",        // ✅ ID de la dernière commande
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error("Erreur chargement clients/commandes :", e);
        setErr("Impossible de charger les clients ou les commandes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6">
      <div className="max-h-[500px] overflow-y-auto border rounded-lg shadow-sm">
        <DataTable columns={userColumns} data={rows} />
      </div>
    </div>
  );
}
