import React from "react";

const orders = [
  {
    id: "CMD5860",
    clientName: "Amadeaus-Junior Wolfgang",
    email: "kant.critique@yopmail.com",
    status: "Payée",
    total: "85,00€",
    date: "17/07/2025 15:20",
    address: "12 rue de Paris, 75010 Paris",
  },
  {
    id: "CMD5861",
    clientName: "Raymond Poulidor",
    email: "raymond.poulidor@yopmail.com",
    status: "En attente",
    total: "45,00€",
    date: "17/07/2025 11:42",
    address: "18 av. Victor Hugo, 69002 Lyon",
  },
  // Ajoute d'autres objets selon ton besoin
];

function OrdersTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 text-left text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nom du client</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2">Montant</th>
            <th className="px-4 py-2">Adresse de livraison</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-gray-800">{order.id}</td>
              <td className="px-4 py-2">{order.clientName}</td>
              <td className="px-4 py-2">{order.email}</td>
              <td className="px-4 py-2">{order.date}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === "Payée"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-2">{order.total}</td>
              <td className="px-4 py-2">{order.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;
