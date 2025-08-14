import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

type SlotDTO = {
  id: number;
  serviceId: number;
  startAt: string; // ISO UTC
  endAt: string;   // ISO UTC
  status: "open" | "booked" | "cancelled";
};

type ServiceSummary = {
  id: number;
  name: string;
};

function onlyDateLocalFR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function onlyTimeLocalFR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Availabilities() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotDTO[]>([]);
  const [servicesById, setServicesById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ✅ états pour la modale de confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<SlotDTO | null>(null);

  // Charge les slots
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<SlotDTO[]>("/slots");
        if (!mounted) return;
        setSlots(res.data ?? []);
      } catch (e: any) {
        setErr(e?.response?.data?.message ?? "Impossible de charger les créneaux.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Charge les services pour mapper serviceId -> name
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<ServiceSummary[]>("/services");
        if (!mounted) return;
        const map: Record<number, string> = {};
        for (const s of res.data ?? []) map[s.id] = s.name;
        setServicesById(map);
      } catch {
        // silencieux: on affichera "Service #id" en fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Regroupe par date locale
  const grouped = useMemo(() => {
    const map = new Map<string, SlotDTO[]>();

    for (const s of slots) {
      const key = onlyDateLocalFR(s.startAt);
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }

    map.forEach((arr) => {
      arr.sort(
        (a: SlotDTO, b: SlotDTO) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );
    });

    return Array.from(map.entries()); // [ [dateLabel, SlotDTO[]], ... ]
  }, [slots]);

  // ⚠️ On NE supprime plus ici directement : on ouvre la modale
  const deleteSlot = async (slot: SlotDTO) => {
    if (slot.status === "booked") return; // protection côté UI
    setSlotToDelete(slot);
    setIsConfirmOpen(true);
  };

  // ✅ Confirmation : on exécute réellement la suppression
  const confirmDelete = async () => {
    if (!slotToDelete) return;
    try {
      setDeletingId(slotToDelete.id);
      await api.delete(`/slots/${slotToDelete.id}`);
      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete.id));
      setIsConfirmOpen(false);
      setSlotToDelete(null);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Échec de la suppression du créneau.");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setSlotToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Disponibilités</h1>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium"
          onClick={() => navigate("/create-availibility")}
        >
          Ajouter un créneau
        </button>
      </div>

      {loading && <p>Chargement…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && !err && (
        <table className="w-full table-auto border border-gray-200 shadow-sm rounded overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Créneaux disponibles</th>
              <th className="px-4 py-2 border-b">Statut</th>
              <th className="px-4 py-2 border-b">Plage horaire</th>
              <th className="px-4 py-2 border-b">Service</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(([dateLabel, daySlots]) => (
              <tr key={dateLabel} className="border-t align-top">
                <td className="px-4 py-3">{dateLabel}</td>
                <td className="px-4 py-3">
                  <ul className="list-disc list-inside">
                    {daySlots.map((s) => (
                      <li key={s.id}>{onlyTimeLocalFR(s.startAt)}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3">
                  <ul className="list-disc list-inside">
                    {daySlots.map((s) => (
                      <li
                        key={s.id}
                        className={
                          s.status === "open"
                            ? "text-green-600"
                            : s.status === "booked"
                            ? "text-orange-600"
                            : "text-red-600"
                        }
                      >
                        {s.status === "open"
                          ? "libre"
                          : s.status === "booked"
                          ? "réservé"
                          : "annulé"}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3">
                  <ul className="list-disc list-inside">
                    {daySlots.map((s) => (
                      <li key={s.id}>
                        {onlyTimeLocalFR(s.startAt)} — {onlyTimeLocalFR(s.endAt)}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3">
                  <ul className="list-disc list-inside">
                    {daySlots.map((s) => (
                      <li key={s.id}>
                        {servicesById[s.serviceId] ?? `Service #${s.serviceId}`}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {daySlots.map((s) => {
                      const isBooked = s.status === "booked";
                      const isDeleting = deletingId === s.id;
                      return (
                        <div key={s.id} className="flex gap-2">
                          <button
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                            onClick={() => navigate(`/slots/${s.id}`)}
                          >
                            Détails
                          </button>
                          <button
                            title={
                              isBooked
                                ? "Créneau réservé — suppression désactivée"
                                : "Supprimer"
                            }
                            disabled={isBooked || isDeleting}
                            onClick={() => deleteSlot(s)}
                            className={`text-sm px-3 py-1 rounded border ${
                              isBooked || isDeleting
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {isDeleting ? "Suppression…" : "Supprimer"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}

            {grouped.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={6}>
                  Aucun créneau pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* ✅ Modale de confirmation */}
      {isConfirmOpen && slotToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-700">
              Voulez-vous vraiment supprimer le créneau du{" "}
              <strong>{onlyDateLocalFR(slotToDelete.startAt)}</strong> à{" "}
              <strong>{onlyTimeLocalFR(slotToDelete.startAt)}</strong> ?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === slotToDelete.id}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId === slotToDelete.id ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
