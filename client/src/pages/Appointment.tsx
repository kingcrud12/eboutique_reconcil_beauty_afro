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

// --- Helpers (LOCAL) ---
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
const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default function Appointment() {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]); // uniquement OPEN pour le service choisi
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSlotModal, setShowSlotModal] = useState(false);
  const [modalSlots, setModalSlots] = useState<Slot[]>([]);

  // auth
  const [isAuthed, setIsAuthed] = useState(false);

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

  // --- Infos utilisateur si authentifié ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const me = await api.get<{ firstName?: string; lastName?: string; email?: string }>("/users/me");
        if (me.data) {
          setIsAuthed(true);
          if (me.data.firstName) setFirstName(me.data.firstName);
          if (me.data.lastName) setLastName(me.data.lastName);
          if (me.data.email) setEmail(me.data.email);
        }
      } catch (e) {
        // si le token est invalide on n’empêche pas la réservation anonyme
        setIsAuthed(false);
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

        // Récup slots du service, puis garde uniquement OPEN
        try {
          const res = await api.get<Slot[]>("/slots", {
            params: { serviceId: selectedService },
          });
          const data = res.data ?? [];
          setSlots(data.filter((s) => s.serviceId === selectedService && s.status === "open"));
        } catch {
          const resAll = await api.get<Slot[]>("/slots");
          setSlots(
            (resAll.data ?? []).filter(
              (s) => s.serviceId === selectedService && s.status === "open"
            )
          );
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

  // Indexe par jour (OPEN only)
  const openSlotsByDay = useMemo(() => {
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

  // Compteur pour pastilles (OPEN only)
  const openCountByDay = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const sl of slots) {
      const key = localDateKeyFromISO(sl.startAt);
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, [slots]);

  const handleClickDay = (date: Date) => {
    setSelectedDate(date);
    const key = localDateKeyFromDate(date);
    const dayOpen = openSlotsByDay[key] ?? [];
    if (dayOpen.length > 0) {
      setModalSlots(dayOpen);
      setShowSlotModal(true);
    } else {
      setModalSlots([]);
      setShowSlotModal(false);
    }
  };

  const handleServiceChange = (val: string) => {
    const id = val ? Number(val) : null;
    setSelectedService(id);
    setSelectedSlot(null);
    setSelectedDate(null);
    // ne pas écraser l’identité si l’utilisateur est connecté
    if (!isAuthed) {
      setFirstName("");
      setLastName("");
      setEmail("");
    }
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

  const selectedServiceObj = useMemo(
    () => (selectedService ? services.find(s => s.id === selectedService) : undefined),
    [selectedService, services]
  );

  const depositAmount = useMemo(() => {
    const price = selectedServiceObj?.price ?? 0;
    return Math.round(price * 0.3 * 100) / 100; // 30% arrondi au centime
  }, [selectedServiceObj]);

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
                    className="w-full aspect-square object-cover rounded-lg shadow-md"
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

        {/* Calendrier — jours sans slots OPEN = gris et désactivés */}
        {selectedService && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">Choisissez une date</h2>
            <Calendar
              value={selectedDate}
              onClickDay={handleClickDay}
              tileContent={({ date }) => {
                const key = localDateKeyFromDate(date);
                const open = openCountByDay[key] ?? 0;
                return open ? (
                  <span className="ml-1 text-[10px] bg-green-600 text-white px-1 rounded">
                    {open}
                  </span>
                ) : null;
              }}
              tileDisabled={({ date }) => {
                const key = localDateKeyFromDate(date);
                return (openCountByDay[key] ?? 0) === 0;
              }}
            />
          </div>
        )}

        {/* Modal : créneaux du jour (OPEN seulement) */}
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
                  Aucun créneau disponible pour cette journée.
                </p>
              ) : (
                <ul className="divide-y">
                  {modalSlots.map((sl) => (
                    <li key={sl.id} className="py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {timeFR(sl.startAt)} — {timeFR(sl.endAt)}
                          </span>
                          <span className="text-xs text-gray-600">
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
                            className={`px-3 py-1 rounded ${
                              selectedSlot?.id === sl.id
                                ? "bg-green-600 text-white"
                                : "bg-black text-white"
                            }`}
                            onClick={() => {
                              setSelectedSlot(sl);
                              setShowSlotModal(false);
                            }}
                          >
                            {selectedSlot?.id === sl.id ? "Sélectionné" : "Choisir"}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
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

            {/* ✅ Message d’acompte */}
            {selectedServiceObj && (
              <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                Un acompte de <strong>{euro(depositAmount)}</strong> (30% de{" "}
                <strong>{selectedServiceObj.name}</strong>) sera payé maintenant
                pour bloquer votre créneau. Le solde sera dû en salon.
              </p>
            )}

            {/* Bouton paiement */}
            {firstName && lastName && email && (
              <div className="mt-6">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="bg-gray-800 text-white px-6 py-3 rounded-md font-semibold disabled:opacity-60"
                >
                  {loading ? "Chargement..." : "Payer un acompte et bloquer le créneau"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
