import DataTable from "../components/DataTable";

function Orders() {
  const orderColumns = [
    { label: "ID Commande", field: "id" },
    { label: "Nom du client", field: "clientName" },
    { label: "Email", field: "email" },
    { label: "Date de commande", field: "date" },
    { label: "Statut", field: "status" },
    { label: "Montant total", field: "total" },
    { label: "Adresse de livraison", field: "address" },
  ];

  const orderData = [
    {
      id: "CMD-5860",
      clientName: "Amadeaus-Junior Wolfgang",
      email: "kant.critique@yopmail.com",
      date: "17/07/2025 15:20",
      status: "Confirmée",
      total: "75,00 €",
      address: "12 rue du Coiffeur, 75010 Paris",
    },
    {
      id: "CMD-5864",
      clientName: "Clara Katz",
      email: "yann.dipita+5000@airweb.de",
      date: "16/07/2025 23:11",
      status: "En attente",
      total: "45,00 €",
      address: "4 impasse Camille, 69007 Lyon",
    },
  ];

  return (
    <div className="p-6">
      <DataTable columns={orderColumns} data={orderData} />
    </div>
  );
}

export default Orders;
