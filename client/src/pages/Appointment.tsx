import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import api from "../connect_to_api/api";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  const carouselSettings = {
    dots: true, infinite: true, speed: 800, slidesToShow: 3, slidesToScroll: 1,
    autoplay: true, autoplaySpeed: 4000, pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="min-h-screen bg-sage-50 text-gray-800 font-sans pb-16">
      <style dangerouslySetInnerHTML={{__html: `
        .react-calendar {
          width: 100%;
          border: none !important;
          font-family: inherit;
          background: transparent;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 1.125rem;
          margin-top: 8px;
          border-radius: 8px;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
          color: #9ca3af;
          padding: 8px 0;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          border-radius: 8px;
          padding: 10px 6px;
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
        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus {
          background: #f3f4f6;
        }
        .react-calendar__tile--active {
          background: #73806f !important;
          color: white !important;
        }
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: #5d6759 !important;
        }
      `}} />

      {/* Header */}
      <div className="relative py-14 md:py-20 px-4 md:px-6 bg-sage-700 text-white text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 md:mb-6">
            Nos Services Coiffure
          </h1>
          <p className="text-base md:text-xl font-light text-sage-100 max-w-2xl mx-auto leading-relaxed">
            Réservez votre moment de détente et de beauté. Nos expertes subliment vos cheveux avec passion et savoir-faire.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10 md:py-14">

        {/* Services Carousel */}
        <div className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-10 text-gray-800">
            Nos Prestations Exclusives
          </h2>

          {servicesByCategory.map(([category, items]) => (
            <div key={category} className="mb-10 md:mb-16">
              <h3 className="text-sm font-semibold mb-6 px-2 text-sage-600 uppercase tracking-[0.15em] text-center md:text-left">{category}</h3>
              <Slider {...carouselSettings} className="pb-8">
                {items.map((srv) => (
                  <div key={srv.id} className="px-3 py-2 h-full">
                    <div
                      onClick={() => handleServiceSelectFromCard(srv.id)}
                      className={`bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col ${selectedService === srv.id ? 'ring-2 ring-sage-500 ring-offset-2' : ''}`}
                    >
                      <div className="relative h-64 overflow-hidden group">
                        <img src={srv.imageUrl || "/placeholder.png"} alt={srv.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sage-700 font-bold text-sm">
                          {srv.price} €
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between text-center">
                        <h4 className="text-base font-semibold text-gray-800 mb-2 font-serif">{srv.name}</h4>
                        <button className="text-xs font-medium text-sage-600 hover:text-sage-700 mt-2 uppercase tracking-wider transition-colors">
                          Choisir ce soin →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ))}
        </div>

        {/* Calendar + Reservation Form */}
        <div id="calendar-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start scroll-mt-24">

          {/* Left: Selector + Calendar */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 order-1">

            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100">
              <label htmlFor="prestation" className="block text-base font-serif font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sage-600" />
                Confirmez votre prestation
              </label>
              <div className="relative">
                <select
                  id="prestation"
                  value={selectedService ?? ""}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:border-sage-500 transition-colors cursor-pointer text-sm font-medium"
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {selectedService && (
              <div className="bg-white p-4 md:p-8 rounded-xl border border-gray-100 transition-all duration-500 overflow-x-hidden">
                <h2 className="text-base font-serif font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-sage-600" />
                  Choisissez une date
                </h2>
                <Calendar
                  value={selectedDate}
                  onClickDay={handleClickDay}
                  minDetail="month"
                  next2Label={null}
                  prev2Label={null}
                  nextLabel={<ChevronRight className="w-5 h-5 text-sage-600" />}
                  prevLabel={<ChevronLeft className="w-5 h-5 text-sage-600" />}
                  tileContent={({ date }) => {
                    const key = localDateKeyFromDate(date);
                    return (openCountByDay[key] ?? 0) > 0 ? (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-sage-500 rounded-full ring-2 ring-white"></div>
                    ) : null;
                  }}
                  tileDisabled={({ date }) => {
                    const key = localDateKeyFromDate(date);
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    return (openCountByDay[key] ?? 0) === 0 || date < today;
                  }}
                  tileClassName="h-10 md:h-14 flex items-center justify-center relative font-medium text-sm md:text-base"
                />
                <p className="mt-4 text-xs text-gray-400 text-center">* Les points verts indiquent les jours disponibles.</p>
              </div>
            )}
          </div>

          {/* Right: Checkout Form */}
          <div className={`lg:col-span-5 transition-all duration-500 order-2 ${selectedSlot ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'} lg:sticky lg:top-28`}>
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 border-t-4 border-t-sage-600">
              <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-800">
                Votre Réservation
              </h2>

              {selectedSlot ? (
                <div className="space-y-6">
                  <div className="p-4 bg-sage-50 rounded-lg border border-sage-100">
                    <p className="text-xs text-sage-700 font-semibold uppercase tracking-wider mb-2">Créneau sélectionné</p>
                    <span className="text-lg font-bold text-gray-800 capitalize">{formatDateFr(new Date(selectedSlot.startAt))}</span>
                    <div className="text-base text-gray-600 mt-1">
                      {timeFR(selectedSlot.startAt)} — {timeFR(selectedSlot.endAt)}
                    </div>
                    <div className="mt-3 pt-3 border-t border-sage-200">
                      <p className="font-medium text-gray-800">{serviceName(selectedSlot.serviceId)}</p>
                      <p className="text-gray-500">{servicePrice(selectedSlot.serviceId)?.toFixed(2)} €</p>
                    </div>
                  </div>

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nom</label>
                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors text-sm" placeholder="Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Prénom</label>
                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors text-sm" placeholder="John" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors text-sm" placeholder="john@example.com" />
                    </div>
                  </form>

                  {selectedServiceObj && (
                    <div className="text-sm bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 space-y-1">
                      <div className="flex justify-between font-bold"><span>Total</span><span>{selectedServiceObj.price} €</span></div>
                      <div className="flex justify-between text-amber-700"><span>Acompte (30%)</span><span>{euro(depositAmount)}</span></div>
                      <p className="text-xs opacity-80 mt-1">Le reste sera à régler sur place.</p>
                    </div>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={loading || !firstName || !lastName || !email}
                    className="w-full bg-sage-600 text-white py-3.5 rounded-lg font-semibold text-base hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Traitement..." : `Réserver • ${euro(depositAmount)}`}
                  </button>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center text-center text-gray-400">
                  <CalendarIcon className="w-14 h-14 mb-4 opacity-20" />
                  <p className="text-base font-medium">Sélectionnez une date et un créneau pour continuer.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slot Modal */}
        {showSlotModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-sage-700 p-5 flex justify-between items-center text-white">
                <h3 className="text-lg font-serif font-bold capitalize">{formatDateFr(selectedDate)}</h3>
                <button className="text-white/80 hover:text-white transition" onClick={() => setShowSlotModal(false)}>✕</button>
              </div>
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {modalSlots.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun créneau disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {modalSlots.map((sl) => (
                      <button
                        key={sl.id}
                        onClick={() => { setSelectedSlot(sl); setShowSlotModal(false); }}
                        className={`w-full group flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${selectedSlot?.id === sl.id ? 'border-sage-500 bg-sage-50 ring-1 ring-sage-500' : 'border-gray-100 hover:border-sage-300 hover:bg-gray-50'}`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-sage-600" />
                            <span className="font-bold text-gray-800 text-sm">{timeFR(sl.startAt)}</span>
                          </div>
                          <span className="text-xs text-gray-500 block mt-1">Fin à {timeFR(sl.endAt)}</span>
                        </div>
                        <div className="bg-white text-sage-700 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm group-hover:bg-sage-600 group-hover:text-white transition-colors">
                          Réserver
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
