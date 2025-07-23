import DataTable from "../components/DataTable";

function Products() {
  const productColumns = [
    { label: "Image", field: "image" },
    { label: "ID", field: "id" },
    { label: "Label", field: "label" },
    { label: "Prix Total (TTC)", field: "price" },
    { label: "Stock", field: "stock" },
    { label: "Actions", field: "actions" },
  ];

  const productData = [
    {
      image: <img src="/image_1.png" alt="Produit 1" className="w-10 h-10 rounded object-cover" />,
      id: 185,
      label: "Shampoo",
      price: "14,99 €",
      stock: 50,
      actions: (
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">Détails</button>
          <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">Supprimer</button>
        </div>
      )
    },
    {
      image: <img src="/image_2.png" alt="Produit 2" className="w-10 h-10 rounded object-cover" />,
      id: 184,
      label: "Body Cream",
      price: "12,99€",
      stock: 12,
      actions: (
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">Détails</button>
          <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">Supprimer</button>
        </div>
      )
    },
    {
      image: <img src="/image_3.png" alt="Produit 3" className="w-10 h-10 rounded object-cover" />,
      id: 183,
      label: "Scented Soap",
      price: "7,99€",
      stock: 89,
      actions: (
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">Détails</button>
          <button className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700">Supprimer</button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des produits</h2>
        <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm">
           Ajouter un produit
        </button>
      </div>
      <DataTable columns={productColumns} data={productData} />
    </div>
  );
}

export default Products;
