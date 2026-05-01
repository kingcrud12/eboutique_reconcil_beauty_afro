import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import api from "../connect_to_api/api";

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
  startAt: string;
  endAt: string;
  status: "open" | "booked" | "cancelled";
};

function localDateKeyFromISO(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function localDateKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDateFr(date: Date) {
  return date.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function timeFR(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

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
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Service[]>("/services");
        setServices(res.data ?? []);
      } catch (e) { console.error("Erreur chargement services", e); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ firstName?: string; lastName?: string; email?: string }>("/users/me");
        if (me.data) {
          setIsAuthed(true);
          if (me.data.firstName) setFirstName(me.data.firstName);
          if (me.data.lastName) setLastName(me.data.lastName);
          if (me.data.email) setEmail(me.data.email);
        }
      } catch { setIsAuthed(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setShowSlotModal(false); setModalSlots([]); setSelectedDate(null); setSelectedSlot(null);
        if (!selectedService) { setSlots([]); return; }
        try {
          const res = await api.get<Slot[]>("/slots", { params: { serviceId: selectedService } });
          setSlots((res.data ?? []).filter(s => s.serviceId === selectedService && s.status === "open"));
        } catch {
          const resAll = await api.get<Slot[]>("/slots");
          setSlots((resAll.data ?? []).filter(s => s.serviceId === selectedService && s.status === "open"));
        }
      } catch (e) { console.error("Erreur chargement slots", e); setSlots([]); }
    })();
  }, [selectedService]);

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) { const arr = map.get(s.category) ?? []; arr.push(s); map.set(s.category, arr); }
    return Array.from(map.entries());
  }, [services]);

  const openSlotsByDay = useMemo(() => {
    const acc: Record<string, Slot[]> = {};
    for (const sl of slots) { const key = localDateKeyFromISO(sl.startAt); (acc[key] ??= []).push(sl); }
    for (const key of Object.keys(acc)) acc[key].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return acc;
  }, [slots]);

  const openCountByDay = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const sl of slots) { const key = localDateKeyFromISO(sl.startAt); acc[key] = (acc[key] ?? 0) + 1; }
    return acc;
  }, [slots]);

  const handleClickDay = (date: Date) => {
    setSelectedDate(date);
    const key = localDateKeyFromDate(date);
    const dayOpen = openSlotsByDay[key] ?? [];
    if (dayOpen.length > 0) { setModalSlots(dayOpen); setShowSlotModal(true); }
    else { setModalSlots([]); setShowSlotModal(false); }
  };

  const handleServiceChange = (val: string) => {
    const id = val ? Number(val) : null;
    setSelectedService(id); setSelectedSlot(null); setSelectedDate(null);
    if (!isAuthed) { setFirstName(""); setLastName(""); setEmail(""); }
  };

  const handleServiceSelectFromCard = (id: number) => {
    handleServiceChange(id.toString());
    document.getElementById("calendar-section")?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    try {
      setLoading(true);
      const res = await api.post(`/payments/slots/checkout/${selectedSlot.id}`);
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) { console.error("Erreur réservation", e); }
    finally { setLoading(false); }
  };

  const selectedServiceObj = useMemo(() => selectedService ? services.find(s => s.id === selectedService) : undefined, [selectedService, services]);
  const depositAmount = useMemo(() => Math.round((selectedServiceObj?.price ?? 0) * 0.3 * 100) / 100, [selectedServiceObj]);
  const serviceName = (id: number) => services.find(s => s.id === id)?.name ?? `Service #${id}`;
  const servicePrice = (id: number) => services.find(s => s.id === id)?.price ?? undefined;

  return (
    <div className="min-h-screen bg-sage-50 text-gray-800 font-sans pb-16">
      <style dangerouslySetInnerHTML={{__html: `
        .react-calendar {
          width: 100%;
          border: none !important;
          font-family: inherit;
          background: transparent;
        }
        .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 1rem;
          border-radius: 8px;
        }
        @media (min-width: 768px) {
          .react-calendar__navigation button {
            font-size: 1.125rem;
          }
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-size: 0.7rem;
          font-weight: 600;
          color: #9ca3af;
          padding: 8px 0;
        }
        @media (min-width: 768px) {
          .react-calendar__month-view__weekdays {
            font-size: 0.75rem;
          }
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          border-radius: 8px;
          padding: 8px 4px;
          font-size: 0.875rem;
        }
        @media (min-width: 768px) {
          .react-calendar__tile {
            padding: 12px 8px;
            font-size: 1rem;
          }
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__tile--now {
          background: #f9fafb;
          color: #111827;
          font-weight: bold;
        }
        .react-calendar__tile--active {
          background: #73806f !important;
          color: white !important;
        }
        /* Fix for smaller screens to prevent overflow */
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
        }
        .react-calendar__tile {
          width: auto !important;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #73806f;
          border-radius: 10px;
        }
      `}} />

      {/* Header */}
      <div className="relative py-12 md:py-24 px-4 bg-sage-700 text-white text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold mb-4 md:mb-8 tracking-tight">
            Nos Services Coiffure
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-light text-sage-100 max-w-2xl mx-auto leading-relaxed px-2">
            Réservez votre moment de détente et de beauté. Nos expertes subliment vos cheveux avec passion et savoir-faire.
          </p>
        </div>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">

        {/* Services Carousel */}
        <div className="mb-16 md:mb-24">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Nos Prestations Exclusives
            </h2>
            <div className="w-16 h-1 bg-sage-500 mx-auto rounded-full"></div>
          </div>

          {servicesByCategory.map(([category, items]) => (
            <div key={category} className="mb-12 md:mb-20">
              <h3 className="text-xs font-bold mb-8 px-2 text-sage-600 uppercase tracking-[0.2em] text-center md:text-left border-l-4 border-sage-500 md:pl-4 ml-2 md:ml-0">{category}</h3>
              
              {/* Desktop Grid / Mobile Horizontal Scroll */}
              <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-12 px-4 -mx-4 md:mx-0 snap-x snap-mandatory custom-scrollbar">
                {items.map((srv) => (
                  <div key={srv.id} className="min-w-full sm:min-w-[300px] md:min-w-0 snap-center px-2">
                    <div
                      onClick={() => handleServiceSelectFromCard(srv.id)}
                      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer h-full flex flex-col ${selectedService === srv.id ? 'ring-2 ring-sage-500 ring-offset-4' : ''}`}
                    >
                      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                        <img 
                          src={srv.imageUrl || "/placeholder.png"} 
                          alt={srv.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sage-700 font-bold text-sm shadow-lg">
                          {srv.price} €
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between text-center md:text-left">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3 font-serif leading-tight">{srv.name}</h4>
                        </div>
                        <button className="text-[11px] font-bold text-sage-600 group-hover:text-sage-700 mt-4 uppercase tracking-[0.15em] transition-all flex items-center justify-center md:justify-start gap-2">
                          Choisir ce soin
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar + Reservation Form */}
        <div id="calendar-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 lg:gap-14 items-start scroll-mt-24">

          {/* Left: Selector + Calendar */}
          <div className="lg:col-span-7 space-y-6 md:space-y-10 order-1">

            <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
              <label htmlFor="prestation" className="block text-lg font-serif font-bold mb-6 text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
                  <Clock className="w-4 h-4" />
                </div>
                Confirmez votre prestation
              </label>
              <div className="relative">
                <select
                  id="prestation"
                  value={selectedService ?? ""}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-4 px-5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 transition-all cursor-pointer text-sm md:text-base font-medium"
                >
                  <option value="">-- Sélectionnez une prestation --</option>
                  {servicesByCategory.map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map((srv) => (
                        <option key={srv.id} value={srv.id}>{srv.name} — {srv.price} €</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            {selectedService && (
              <div className="bg-white p-5 md:p-10 rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 overflow-hidden">
                <h2 className="text-lg font-serif font-bold mb-8 text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  Choisissez une date
                </h2>
                <div className="px-1 sm:px-4">
                  <Calendar
                    value={selectedDate}
                    onClickDay={handleClickDay}
                    minDetail="month"
                    next2Label={null}
                    prev2Label={null}
                    nextLabel={<ChevronRight className="w-6 h-6 text-sage-600" />}
                    prevLabel={<ChevronLeft className="w-6 h-6 text-sage-600" />}
                    tileContent={({ date }) => {
                      const key = localDateKeyFromDate(date);
                      return (openCountByDay[key] ?? 0) > 0 ? (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-sage-500 rounded-full ring-2 ring-white shadow-sm"></div>
                      ) : null;
                    }}
                    tileDisabled={({ date }) => {
                      const key = localDateKeyFromDate(date);
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      return (openCountByDay[key] ?? 0) === 0 || date < today;
                    }}
                    tileClassName="h-12 sm:h-16 md:h-20 flex items-center justify-center relative font-medium transition-all duration-200"
                  />
                </div>
                <div className="mt-8 flex items-center justify-center gap-4 text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <span>Complet</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Checkout Form */}
          <div className={`lg:col-span-5 transition-all duration-700 order-2 ${selectedSlot ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'} lg:sticky lg:top-28 pb-10`}>
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-xl border-t-[6px] border-t-sage-600">
              <h2 className="text-2xl font-serif font-bold mb-8 text-gray-900">
                Votre Réservation
              </h2>

              {selectedSlot ? (
                <div className="space-y-8">
                  <div className="p-5 bg-sage-50 rounded-2xl border border-sage-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sage-400"></div>
                    <p className="text-[10px] text-sage-600 font-bold uppercase tracking-[0.2em] mb-3">Créneau sélectionné</p>
                    <span className="text-xl font-bold text-gray-900 capitalize block mb-1">{formatDateFr(new Date(selectedSlot.startAt))}</span>
                    <div className="text-base text-gray-600 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sage-400" />
                      {timeFR(selectedSlot.startAt)} — {timeFR(selectedSlot.endAt)}
                    </div>
                    <div className="mt-5 pt-5 border-t border-sage-200/60">
                      <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{serviceName(selectedSlot.serviceId)}</p>
                      <p className="text-sage-600 font-bold">{servicePrice(selectedSlot.serviceId)?.toFixed(2)} €</p>
                    </div>
                  </div>

                  <form className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nom</label>
                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 focus:bg-white transition-all text-sm md:text-base" placeholder="Votre nom" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Prénom</label>
                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 focus:bg-white transition-all text-sm md:text-base" placeholder="Votre prénom" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 focus:bg-white transition-all text-sm md:text-base" placeholder="votre@email.com" />
                    </div>
                  </form>

                  {selectedServiceObj && (
                    <div className="text-sm bg-gray-50 text-gray-800 p-6 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex justify-between font-bold text-base"><span>Total prestation</span><span className="text-gray-900">{selectedServiceObj.price} €</span></div>
                      <div className="flex justify-between text-sage-700 font-bold"><span>Acompte à régler (30%)</span><span>{euro(depositAmount)}</span></div>
                      <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-400 leading-relaxed italic text-center">
                        Le solde restants sera à régler directement au salon le jour du rendez-vous.
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={loading || !firstName || !lastName || !email}
                    className="w-full bg-gray-900 text-white py-5 rounded-xl font-bold text-base hover:bg-sage-700 transition-all shadow-lg hover:shadow-sage-700/20 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                  >
                    {loading ? "Chargement..." : (
                      <>
                        Confirmer & Régler l'accompte
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center text-center text-gray-300">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <CalendarIcon className="w-10 h-10 opacity-30" />
                  </div>
                  <p className="text-base font-medium max-w-[200px] mx-auto text-gray-400">Sélectionnez une date et un créneau pour continuer.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slot Modal */}
        {showSlotModal && selectedDate && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/20">
              <div className="bg-sage-700 p-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-sage-200" />
                  <h3 className="text-xl font-serif font-bold capitalize">{formatDateFr(selectedDate)}</h3>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white" onClick={() => setShowSlotModal(false)}>✕</button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-gray-50/50">
                {modalSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Aucun créneau disponible pour ce jour.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modalSlots.map((sl) => (
                      <button
                        key={sl.id}
                        onClick={() => { setSelectedSlot(sl); setShowSlotModal(false); }}
                        className={`w-full group flex items-center justify-between p-5 rounded-2xl border bg-white shadow-sm transition-all duration-300 ${selectedSlot?.id === sl.id ? 'border-sage-500 ring-2 ring-sage-500/20' : 'border-gray-100 hover:border-sage-300 hover:shadow-md'}`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-sage-600" />
                            <span className="font-bold text-gray-900 text-lg">{timeFR(sl.startAt)}</span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium block">Fin prévue à {timeFR(sl.endAt)}</span>
                        </div>
                        <div className="bg-sage-50 text-sage-700 text-xs font-bold px-5 py-2.5 rounded-xl group-hover:bg-sage-600 group-hover:text-white transition-all shadow-sm">
                          Sélectionner
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-gray-100 bg-white text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Choisissez votre heure de passage</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
