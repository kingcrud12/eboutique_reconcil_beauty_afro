import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function CreateProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    Weight: "",
    category: "",
    image: null as File | null,
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("weight", form.Weight);
    formData.append("category", form.category);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      navigate("/Products");
      setError("");
      console.log("Produit créé :", response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la création");
      setSuccess(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Créer un produit</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          onChange={handleChange}
          placeholder="Nom du produit"
          className="w-full p-2 border"
        />
        <textarea
          name="description"
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border"
        />
        <input
          name="price"
          onChange={handleChange}
          placeholder="Prix"
          className="w-full p-2 border"
        />
        <input
          name="stock"
          onChange={handleChange}
          placeholder="Stock"
          className="w-full p-2 border"
        />
        <input
          name="weight"
          onChange={handleChange}
          placeholder="Poids"
          className="w-full p-2 border"
        />
        <input
          name="category"
          onChange={handleChange}
          placeholder="Catégorie"
          className="w-full p-2 border"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />

        <div className=" flex gap-x-10 ">
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded mt-[50px]"
          >
            Créer
          </button>
          <button
            onClick={() => navigate("/Products")}
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded mt-[50px]"
          >
            Retour
          </button>
        </div>
      </form>

      {success && (
        <p className="text-green-600 mt-4">Produit créé avec succès !</p>
      )}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}

export default CreateProduct;
