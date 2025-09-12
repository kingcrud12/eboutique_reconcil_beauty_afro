import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { IProduct } from "../api/product.interfaces";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const productColumns = [
    { label: "Image", field: "image" },
    { label: "ID", field: "id" },
    { label: "Nom", field: "label" },
    { label: "Prix Total (TTC)", field: "price" },
    { label: "Stock", field: "stock" },
    { label: "Weight", field: "weight" },
    { label: "Category", field: "category" },
    { label: "Actions", field: "actions" },
  ];

  const formatProductData = (products: IProduct[]) =>
    products.map((product) => ({
      image: (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-10 h-10 rounded object-cover"
        />
      ),
      id: product.id,
      label: product.name,
      price: `${parseFloat(product.price).toFixed(2)} €`,
      stock: product.stock,
      weight: `${product.weight} g`,
      category: product.category,
      actions: (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/products/${product.id}`)}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
          >
            Détails
          </button>
          <button
            className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
            onClick={() => {
              setProductToDelete(product.id);
              setShowModal(true);
            }}
          >
            Supprimer
          </button>
        </div>
      ),
    }));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<IProduct[]>("/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      }
    };

    fetchProducts();
  }, []);

  const confirmDelete = async () => {
    if (productToDelete !== null) {
      try {
        await api.delete(`/products/${productToDelete}`);
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
        setShowModal(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des produits</h2>
        <button
          onClick={() => navigate("/Product")}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
        >
          Ajouter un produit
        </button>
      </div>
      <DataTable columns={productColumns} data={formatProductData(products)} />
      {/* MODAL DE CONFIRMATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">
              Êtes-vous sûr de vouloir réaliser cette action ?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
