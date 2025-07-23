import React from "react";
import DataTable from "../components/DataTable";

const userColumns = [
  { label: "Nom", field: "lastName" },
  { label: "Prénom", field: "firstName" },
  { label: "Email", field: "email" },
  { label: "Date de création", field: "createdAt" },
  { label: "Dernière commande", field: "lastOrder" },
];

const users = [
  {
    lastName: "WOLFANG",
    firstName: "Amadeaus-Junior",
    email: "kant.critique@yopmail.com",
    createdAt: "17/07/2025 15:20",
    lastOrder: "5860",
  },
  {
    lastName: "POULIDOR",
    firstName: "Raymond",
    email: "raymond.poulidor@yopmail.com",
    createdAt: "17/07/2025 11:42",
    lastOrder: "-",
  },
];

function Customers() {
  return (
    <div className="p-6">
      <DataTable columns={userColumns} data={users} />
    </div>
  );
}

export default Customers;
