import React from "react";

function Availabilities() {
  const slots = [
    {
      date: "22/07/2025",
      times: [
        { hour: "09:00", status: "libre" },
        { hour: "10:00", status: "réservé" },
        { hour: "11:00", status: "libre" },
      ],
    },
    {
      date: "23/07/2025",
      times: [
        { hour: "14:00", status: "réservé" },
        { hour: "15:00", status: "libre" },
      ],
    },
    {
      date: "25/07/2025",
      times: [
        { hour: "10:00", status: "libre" },
        { hour: "16:00", status: "libre" },
        { hour: "17:00", status: "réservé" },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Disponibilités</h1>
        <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium">
           Ajouter un créneau
        </button>
      </div>

      <table className="w-full table-auto border border-gray-200 shadow-sm rounded overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2 border-b">Date</th>
            <th className="px-4 py-2 border-b">Créneaux disponibles</th>
            <th className="px-4 py-2 border-b">Statut</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-3">{slot.date}</td>
              <td className="px-4 py-3 align-top">
                <ul className="list-disc list-inside">
                  {slot.times.map((t, i) => (
                    <li key={i}>{t.hour}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 align-top">
                <ul className="list-disc list-inside">
                  {slot.times.map((t, i) => (
                    <li key={i} className={t.status === "libre" ? "text-green-600" : "text-red-600"}>
                      {t.status}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">
                    Modifier
                  </button>
                  <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Availabilities;
