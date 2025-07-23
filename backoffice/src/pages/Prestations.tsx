import React from "react";
import DataTable from "../components/DataTable";

function Prestations() {
  const serviceColumns = [
    { label: "Image", field: "image" },
    { label: "Label", field: "label" },
    { label: "Nom", field: "name" },
    { label: "Prix", field: "price" },
    { label: "Actions", field: "actions" },
  ];

  const serviceData = [
    {
      image: (
        <img
          src="/hair_1.jpg"
          alt="Tresses"
          className="w-10 h-10 rounded object-cover"
        />
      ),
      label: "Tresses africaines",
      name: "Tresses longues",
      price: "35 €",
      actions: (
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">
            Détails
          </button>
          <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">
            Supprimer
          </button>
        </div>
      ),
    },
    {
      image: (
        <img
          src="/hair_2.jpg"
          alt="Locks"
          className="w-10 h-10 rounded object-cover"
        />
      ),
      label: "Locks",
      name: "Locks mi-longues",
      price: "50 €",
      actions: (
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">
            Détails
          </button>
          <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Prestations coiffures</h2>
        <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-800">
          Ajouter une prestation
        </button>
      </div>
      <DataTable columns={serviceColumns} data={serviceData} />
    </div>
  );
}

export default Prestations;
