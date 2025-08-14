import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // ✅ ton instance axios

function CreatePrestation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    duration: "",
    price: "",
    image: null as File | null, // ✅ fichier image
    category: "",
    subcategory: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm({ ...form, [name]: files[0] }); // image
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("duration", form.duration);
      formData.append("price", form.price);
      if (form.image) formData.append("image", form.image);
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory);

      await api.post("/services", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/prestations");
    } catch (err) {
      console.error(err);
      alert("Impossible de créer la prestation");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Créer une prestation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Nom" value={form.name} onChange={handleChange} className="border p-2 w-full" required />
        <input name="duration" type="number" placeholder="Durée (min)" value={form.duration} onChange={handleChange} className="border p-2 w-full" required />
        <input name="price" placeholder="Prix" value={form.price} onChange={handleChange} className="border p-2 w-full" required />

        {/* Champ image */}
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="border p-2 w-full" />

        <input name="category" placeholder="Catégorie" value={form.category} onChange={handleChange} className="border p-2 w-full" required />
        <input name="subcategory" placeholder="Sous-catégorie" value={form.subcategory} onChange={handleChange} className="border p-2 w-full" required />

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={() => navigate("/prestations")} className="px-4 py-2 border rounded">
            Annuler
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Créer
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePrestation;
