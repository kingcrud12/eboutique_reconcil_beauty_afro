import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { IProduct } from "../api/product.interfaces";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const baseUrl = "http://localhost:3003";

  const productColumns = [
    { label: "Image", field: "image" },
    { label: "ID", field: "id" },
    { label: "Nom", field: "label" },
    { label: "Prix Total (TTC)", field: "price" },
    { label: "Stock", field: "stock" },
    { label: "Category", field: "category" },
    { label: "Actions", field: "actions" },
  ];

  const formatProductData = (products: IProduct[]) =>
    products.map((product) => ({
      image: (
        <img
        src={`${baseUrl}${product.imageUrl}`}
          alt={product.name}
          className="w-10 h-10 rounded object-cover"
        />
      ),
      id: product.id,
      label: product.name,
      price: `${parseFloat(product.price).toFixed(2)} €`,
      stock: product.stock,
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
            onClick={() => handleDelete(product.id)}
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

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
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
    </div>
  );
}

export default Products;
