import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../api/api";

type Service = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  category: string;
};

type Slot = {
  id: number;
  serviceId: number;
  startAt: string; // ISO UTC
  endAt: string;   // ISO UTC
  status: "open" | "booked" | "cancelled";
};

// --- Helpers (LOCAL, pas UTC) ---
function localDateKeyFromISO(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function localDateKeyFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDateFr(date: Date) {
  return date.toLocaleDateString("fr-FR");
}
function timeFR(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Appointment() {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSlotModal, setShowSlotModal] = useState(false);
  const [modalSlots, setModalSlots] = useState<Slot[]>([]);

  // --- Services ---
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Service[]>("/services");
        setServices(res.data ?? []);
      } catch (e) {
        console.error("Erreur chargement services", e);
      }
    })();
  }, []);

  // --- Slots (rechargés à chaque changement de service) ---
  useEffect(() => {
    (async () => {
      try {
        setShowSlotModal(false);
        setModalSlots([]);
        setSelectedDate(null);
        setSelectedSlot(null);

        if (!selectedService) {
          setSlots([]);
          return;
        }

        // On demande idéalement /slots?serviceId=…
        try {
          const res = await api.get<Slot[]>("/slots", {
            params: { serviceId: selectedService },
          });
          const data = res.data ?? [];
          // filtre côté front pour être sûr de ne garder QUE ce service
          setSlots(data.filter((s) => s.serviceId === selectedService));
        } catch {
          // Fallback: tout, puis filtre local par service
          const resAll = await api.get<Slot[]>("/slots");
          setSlots((resAll.data ?? []).filter((s) => s.serviceId === selectedService));
        }
      } catch (e) {
        console.error("Erreur chargement slots", e);
        setSlots([]);
      }
    })();
  }, [selectedService]);

  // Groupes services par catégorie
  const servicesByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return Array.from(map.entries());
  }, [services]);

  // Indexe par jour LOCAL (tous les statuts)
  const slotsByDay = useMemo(() => {
    const acc: Record<string, Slot[]> = {};
    for (const sl of slots) {
      const key = localDateKeyFromISO(sl.startAt);
      (acc[key] ??= []).push(sl);
    }
    for (const key of Object.keys(acc)) {
      acc[key].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );
    }
    return acc;
  }, [slots]);

  // Compteurs pour pastilles dans le calendrier
  const openCountByDay = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const sl of slots) {
      if (sl.status !== "open") continue;
      const key = localDateKeyFromISO(sl.startAt);
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, [slots]);

  const bookedCountByDay = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const sl of slots) {
      if (sl.status !== "booked") continue;
      const key = localDateKeyFromISO(sl.startAt);
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, [slots]);

  const handleClickDay = (date: Date) => {
    setSelectedDate(date);
    const key = localDateKeyFromDate(date);
    const dayAll = slotsByDay[key] ?? [];
    if (dayAll.length > 0) {
      setModalSlots(dayAll); // 🔸 montre OPEN + BOOKED
      setShowSlotModal(true);
    } else {
      setModalSlots([]);
      setShowSlotModal(false);
    }
  };

  const handleServiceChange = (val: string) => {
    const id = val ? Number(val) : null;
    setSelectedService(id);
    setFirstName("");
    setLastName("");
    setEmail("");
    setSelectedSlot(null);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    try {
      setLoading(true);
      const res = await api.post(`/payments/slots/checkout/${selectedSlot.id}`);
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      console.error("Erreur réservation", e);
    } finally {
      setLoading(false);
    }
  };

  const serviceName = (id: number) =>
    services.find((s) => s.id === id)?.name ?? `Service #${id}`;
  const servicePrice = (id: number) =>
    services.find((s) => s.id === id)?.price ?? undefined;

  return (
    <div className="mt-[90px] px-6 py-16 bg-white text-slate-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          Prenez rendez-vous pour une prestation de coiffure
        </h1>

        {/* Vitrine */}
        {servicesByCategory.map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {items.map((srv) => (
                <div key={srv.id} className="text-center">
                  <img
                    src={srv.imageUrl || "/placeholder.png"}
                    alt={srv.name}
                    className="w-full h-36 object-cover rounded-lg shadow-md"
                  />
                  <p className="mt-2 font-semibold">{srv.name}</p>
                  <p className="text-gray-600">{srv.price} €</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Sélecteur Catégorie -> Services */}
        <div className="mb-6">
          <label htmlFor="prestation" className="block font-medium mb-2">
            Choisissez une prestation :
          </label>
          <select
            id="prestation"
            value={selectedService ?? ""}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">-- Sélectionnez --</option>
            {servicesByCategory.map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — {srv.price} €
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Calendrier */}
        {selectedService && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">Choisissez une date</h2>
            <Calendar
              value={selectedDate}
              onClickDay={handleClickDay}
              tileContent={({ date }) => {
                const key = localDateKeyFromDate(date);
                const open = openCountByDay[key] ?? 0;
                const booked = bookedCountByDay[key] ?? 0;
                if (!open && !booked) return null;
                return (
                  <div className="mt-1 flex gap-1 justify-center">
                    {open > 0 && (
                      <span className="text-[10px] bg-green-600 text-white px-1 rounded">
                        {open}
                      </span>
                    )}
                    {booked > 0 && (
                      <span className="text-[10px] bg-gray-400 text-white px-1 rounded">
                        {booked}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        )}

        {/* Modal : créneaux du jour (OPEN + BOOKED, booked désactivés) */}
        {showSlotModal && selectedDate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                onClick={() => setShowSlotModal(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-2">
                Créneaux le {formatDateFr(selectedDate)}
              </h3>

              {modalSlots.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Aucun créneau pour cette journée.
                </p>
              ) : (
                <ul className="divide-y">
                  {modalSlots.map((sl) => {
                    const isBooked = sl.status === "booked";
                    return (
                      <li key={sl.id} className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className={`font-medium ${isBooked ? "text-gray-400" : ""}`}>
                              {timeFR(sl.startAt)} — {timeFR(sl.endAt)}
                            </span>
                            <span className={`text-xs ${isBooked ? "text-gray-400" : "text-gray-600"}`}>
                              {serviceName(sl.serviceId)}
                              {servicePrice(sl.serviceId) !== undefined
                                ? ` · ${servicePrice(sl.serviceId)} €`
                                : ""}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 rounded border hover:bg-gray-50"
                              onClick={() => setShowSlotModal(false)}
                            >
                              Annuler
                            </button>
                            <button
                              disabled={isBooked}
                              title={isBooked ? "Déjà réservé" : ""}
                              className={`px-3 py-1 rounded ${
                                isBooked
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : selectedSlot?.id === sl.id
                                  ? "bg-green-600 text-white"
                                  : "bg-black text-white"
                              }`}
                              onClick={() => {
                                if (!isBooked) {
                                  setSelectedSlot(sl);
                                  setShowSlotModal(false);
                                }
                              }}
                            >
                              {isBooked
                                ? "Réservé"
                                : selectedSlot?.id === sl.id
                                ? "Sélectionné"
                                : "Choisir"}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Formulaire + paiement Stripe */}
        {selectedSlot && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">
              Informations de contact
            </h2>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium">Nom :</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Prénom :
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">
                  Email :
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </form>

            {firstName && lastName && email && (
              <div className="mt-6">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold disabled:opacity-60"
                >
                  {loading ? "Chargement..." : "Payer un accompte et bloquer le créneau"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
