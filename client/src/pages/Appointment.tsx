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
  startAt: string; // ISO UTC
  endAt: string; // ISO UTC
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
  return date.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function timeFR(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    n
  );

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
    (async () => {
      try {
        const me = await api.get<{
          firstName?: string;
          lastName?: string;
          email?: string;
        }>("/users/me");
        if (me.data) {
          setIsAuthed(true);
          if (me.data.firstName) setFirstName(me.data.firstName);
          if (me.data.lastName) setLastName(me.data.lastName);
          if (me.data.email) setEmail(me.data.email);
        }
      } catch (e) {
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
          setSlots(
            data.filter(
              (s) => s.serviceId === selectedService && s.status === "open"
            )
          );
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
    if (!isAuthed) {
      setFirstName("");
      setLastName("");
      setEmail("");
    }
  };

  const handleServiceSelectFromCard = (id: number) => {
    handleServiceChange(id.toString());
    // Optionally scroll to calendar or selector
    const element = document.getElementById("calendar-section");
    if (element) element.scrollIntoView({ behavior: 'smooth' });
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
    () =>
      selectedService
        ? services.find((s) => s.id === selectedService)
        : undefined,
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


  // Carousel Settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  return (
    <div className="mt-[64px] min-h-screen bg-gradient-to-b from-white to-gray-50 text-slate-800 font-sans">

      {/* Header Section */}
      <div className="relative py-12 md:py-20 px-4 md:px-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-playfair font-bold mb-4 md:mb-6 animate-fade-in-up">
            L'Art de la Coiffure Afro
          </h1>
          <p className="text-base md:text-xl font-light text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Réservez votre moment de détente et de beauté. Nos expertes subliment vos cheveux avec passion et savoir-faire.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Carousel Section */}
        <div className="mb-8 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-center mb-8 md:mb-12 text-gray-900 border-b-2 border-purple-100 pb-4 inline-block mx-auto">
            Nos Prestations Exclusives
          </h2>

          {servicesByCategory.map(([category, items]) => (
            <div key={category} className="mb-8 md:mb-16">
              <h3 className="text-lg md:text-xl font-semibold mb-6 px-2 text-purple-900 uppercase tracking-widest text-center md:text-left">{category}</h3>
              <Slider {...carouselSettings} className="pb-8">
                {items.map((srv) => (
                  <div key={srv.id} className="px-2 md:px-3 py-2 h-full">
                    <div
                      onClick={() => handleServiceSelectFromCard(srv.id)}
                      className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 h-full flex flex-col ${selectedService === srv.id ? 'ring-2 ring-purple-600 ring-offset-2' : ''}`}
                    >
                      <div className="relative h-96 md:h-64 overflow-hidden group">
                        <img
                          src={srv.imageUrl || "/placeholder.png"}
                          alt={srv.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-purple-900 font-bold shadow-sm text-sm">
                          {srv.price} €
                        </div>
                      </div>
                      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between text-center">
                        <h4 className="text-base md:text-lg font-bold text-gray-800 mb-2 font-playfair">{srv.name}</h4>
                        <button className="text-xs md:text-sm font-medium text-purple-700 hover:text-purple-900 mt-2 uppercase tracking-wider">
                          Choisir ce soin
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ))}
        </div>


        <div id="calendar-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start scroll-mt-24">

          {/* Left Column: Selector & Calendar */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 animate-fade-in order-1">

            {/* Custom Select Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
              <label htmlFor="prestation" className="block text-lg font-playfair font-bold mb-4 text-purple-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Confirmez votre prestation
              </label>
              <div className="relative">
                <select
                  id="prestation"
                  value={selectedService ?? ""}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 md:py-4 px-4 md:px-6 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-purple-500 transition-colors cursor-pointer text-sm md:text-base font-medium"
                >
                  <option value="">-- Sélectionnez une prestation --</option>
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
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Calendar Container */}
            {selectedService && (
              <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-500 overflow-x-hidden">
                <h2 className="text-lg font-playfair font-bold mb-4 md:mb-6 text-purple-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Choisissez une date
                </h2>
                <Calendar
                  value={selectedDate}
                  onClickDay={handleClickDay}
                  minDetail="month"
                  next2Label={null}
                  prev2Label={null}
                  nextLabel={<ChevronRight className="w-5 h-5 text-purple-800" />}
                  prevLabel={<ChevronLeft className="w-5 h-5 text-purple-800" />}
                  tileContent={({ date }) => {
                    const key = localDateKeyFromDate(date);
                    const open = openCountByDay[key] ?? 0;
                    return open ? (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white"></div>
                    ) : null;
                  }}
                  tileDisabled={({ date }) => {
                    const key = localDateKeyFromDate(date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const noOpenSlots = (openCountByDay[key] ?? 0) === 0;
                    const pastDate = date < today;
                    return noOpenSlots || pastDate;
                  }}
                  tileClassName="h-10 md:h-14 flex items-center justify-center relative font-medium text-sm md:text-base"
                />
                <p className="mt-4 text-xs md:text-sm text-gray-500 text-center italic">
                  * Les points verts indiquent les jours disponibles.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Form (Sticky) */}
          <div className={`lg:col-span-5 transition-all duration-500 order-2 ${selectedSlot ? 'opacity-100 translate-x-0' : 'opacity-50 lg:opacity-50 lg:translate-x-4 grayscale lg:grayscale pointer-events-none lg:pointer-events-none opacity-100 translate-x-0 grayscale-0 pointer-events-auto'} lg:sticky lg:top-28`}>
            {/* Note logic above: On mobile we don't want to fade/disable it completely if we want them to see it, but actually, they select date FIRST.
                However, to avoid confusion on mobile where they scroll down and see a disabled form, we keep the logic similar but maybe less aggressive on opacity if it scrolls.
                Actually, the original logic requires a slot to be selected. Slot is selected via modal on day click.
                So until slot is selected, this part is disabled. That's fine.
            */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl border-t-4 border-purple-900 border-opacity-100 mt-8 lg:mt-0">
              <h2 className="text-xl md:text-2xl font-playfair font-bold mb-6 md:mb-8 text-gray-900">
                Votre Réservation
              </h2>

              {selectedSlot ? (
                <div className="space-y-6">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs md:text-sm text-purple-900 font-semibold uppercase tracking-wider mb-2">Créneau sélectionné</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{formatDateFr(new Date(selectedSlot.startAt))}</span>
                    </div>
                    <div className="text-base md:text-lg text-gray-700 mt-1">
                      {timeFR(selectedSlot.startAt)} — {timeFR(selectedSlot.endAt)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="font-medium text-gray-900">{serviceName(selectedSlot.serviceId)}</p>
                      <p className="text-gray-500">{servicePrice(selectedSlot.serviceId)?.toFixed(2)} €</p>
                    </div>
                  </div>

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prénom</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </form>

                  {/* Message d’acompte */}
                  {selectedServiceObj && (
                    <div className="text-sm bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 flex flex-col gap-2">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span>{selectedServiceObj.price} €</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-700">
                        <span>Acompte à payer (30%)</span>
                        <span>{euro(depositAmount)}</span>
                      </div>
                      <p className="text-xs opacity-80 mt-1">Le reste sera à régler sur place.</p>
                    </div>
                  )}

                  {/* Bouton paiement */}
                  <button
                    onClick={handleConfirm}
                    disabled={loading || !firstName || !lastName || !email}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? "Traitement..." : `Réserver • ${euro(depositAmount)}`}
                  </button>

                </div>
              ) : (
                <div className="py-8 md:py-12 flex flex-col items-center justify-center text-center text-gray-400">
                  <CalendarIcon className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-20" />
                  <p className="text-base md:text-lg font-medium">Sélectionnez une date et un créneau à gauche pour continuer.</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Modal : créneaux du jour (OPEN seulement) */}
        {showSlotModal && selectedDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
              <div className="bg-purple-900 p-4 md:p-6 flex justify-between items-center text-white">
                <h3 className="text-lg md:text-xl font-playfair font-bold">
                  {formatDateFr(selectedDate)}
                </h3>
                <button
                  className="text-white/80 hover:text-white transition"
                  onClick={() => setShowSlotModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto">
                {modalSlots.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun créneau disponible.</p>
                ) : (
                  <div className="space-y-3">
                    {modalSlots.map((sl) => (
                      <button
                        key={sl.id}
                        onClick={() => {
                          setSelectedSlot(sl);
                          setShowSlotModal(false);
                          // Scroll to form on mobile
                          // NOTE: We could add auto-scroll here if needed for mobile UX
                          setTimeout(() => {
                            const el = document.getElementById("calendar-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        className={`w-full group flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all duration-200 ${selectedSlot?.id === sl.id ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-100 hover:border-purple-300 hover:bg-gray-50'}`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="font-bold text-gray-800 text-sm md:text-base">{timeFR(sl.startAt)}</span>
                          </div>
                          <span className="text-xs text-gray-500 block mt-1">Fin à {timeFR(sl.endAt)}</span>
                        </div>
                        <div className="bg-white text-purple-900 text-xs md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
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
