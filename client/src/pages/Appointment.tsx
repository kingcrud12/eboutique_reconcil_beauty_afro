import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const prestations = [
  { id: 1, name: "Tresses simples", price: "25€", image: "hair_1.jpg" },
  { id: 2, name: "Nattes collées", price: "30€", image: "hair_2.jpg" },
  { id: 3, name: "Perruque pose + coupe", price: "45€", image: "hair_2.jpg" },
  { id: 4, name: "Coiffure enfant", price: "20€", image: "hair_3.jpg" },
];

const availableSlots: { [key: string]: string[] } = {
  "2025-07-22": ["09:00", "10:00", "11:00"],
  "2025-07-23": ["14:00", "15:00"],
  "2025-07-25": ["10:00", "16:00", "17:00"],
};

const Appointment = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selected = prestations.find((p) => p.id === selectedService);
  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];
  const formatDateFr = (date: Date) => date.toLocaleDateString('fr-FR');

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div className="mt-[90px] px-6 py-16 bg-white text-slate-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">
          Prenez rendez-vous pour une prestation de coiffure
        </h1>

        {/* Affichage images + nom des prestations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {prestations.map((p) => (
            <div key={p.id} className="text-center">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-36 object-cover rounded-lg shadow-md"
              />
              <p className="mt-2 font-semibold">{p.name}</p>
            </div>
          ))}
        </div>

        {/* Choix prestation */}
        <div className="mb-6">
          <label htmlFor="prestation" className="block font-medium mb-2">Choisissez une prestation :</label>
          <select
            id="prestation"
            value={selectedService ?? ""}
            onChange={(e) => {
              setSelectedService(Number(e.target.value));
              setSelectedDate(null);
              setSelectedSlot(null);
              setFirstName(""); setLastName(""); setEmail("");
              setIsConfirmed(false);
            }}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">-- Sélectionnez --</option>
            {prestations.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.price}
              </option>
            ))}
          </select>
        </div>

        {/* Calendrier */}
        {selected && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Choisissez une date</h2>
            <Calendar
              onChange={(date) => {
                setSelectedDate(date as Date);
                setSelectedSlot(null);
                setIsConfirmed(false);
                setFirstName(""); setLastName(""); setEmail("");
              }}
              value={selectedDate}
              tileContent={({ date }) => {
                const key = formatDateKey(date);
                const slots = availableSlots[key];
                if (slots) {
                  return (
                    <abbr title={`Créneaux disponibles : ${slots.join(", ")}`}>
                      <span className="text-yellow-600 text-sm">🕒</span>
                    </abbr>
                  );
                }
                return null;
              }}
              tileClassName={({ date }) =>
                availableSlots[formatDateKey(date)] ? "bg-yellow-100 rounded-full" : ""
              }
            />
          </div>
        )}

        {/* Créneaux */}
        {selected && selectedDate && availableSlots[formatDateKey(selectedDate)] && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">
              Créneaux disponibles pour le {formatDateFr(selectedDate)}
            </h2>
            <div className="flex flex-wrap gap-3">
              {availableSlots[formatDateKey(selectedDate)].map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setIsConfirmed(false);
                  }}
                  className={`border rounded-md px-4 py-2 hover:bg-green-100 ${
                    selectedSlot === slot ? "bg-green-500 text-white" : "bg-white text-slate-800"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire de contact */}
        {selected && selectedDate && selectedSlot && (
          <div className="mb-6 mt-8">
            <h2 className="text-lg font-semibold mb-4">Informations de contact</h2>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="lastName" className="block mb-1 text-sm font-medium">Nom :</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block mb-1 text-sm font-medium">Prénom :</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block mb-1 text-sm font-medium">Adresse email :</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </form>

            {/* Bouton de validation */}
            {firstName && lastName && email && (
              <div className="mt-6">
                <button
                  onClick={handleConfirm}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold"
                >
                  Bloquer le créneau
                </button>
              </div>
            )}
          </div>
        )}

        {/* Confirmation */}
        {isConfirmed && selected && selectedDate && selectedSlot && (
          <div className="mt-8 bg-green-100 p-4 rounded-lg text-green-800 font-medium">
            ✅ Rendez-vous confirmé pour : <strong>{selected.name}</strong><br />
            📅 Le : <strong>{formatDateFr(selectedDate)}</strong> à <strong>{selectedSlot}</strong> — {selected.price}<br />
            👤 Client : <strong>{firstName} {lastName}</strong><br />
            📧 Email : <strong>{email}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
