import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // ✅ ton instance axios

type ServiceLite = {
  id: number | string;
  name?: string;
  category?: string | null;
  subcategory?: string | null;
};

function CreatePrestation() {
  const navigate = useNavigate();

  // ----- Formulaire
  const [form, setForm] = useState({
    name: "",
    duration: "",
    price: "",
    image: null as File | null,
    category: "",
    subcategory: "",
  });

  // ----- Données pour selects
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
  const [errorMeta, setErrorMeta] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingMeta(true);
        setErrorMeta(null);
        const res = await api.get<ServiceLite[]>("/services");
        setServices(res.data ?? []);
      } catch (e) {
        console.error("Erreur chargement services :", e);
        setErrorMeta("Impossible de récupérer les catégories existantes.");
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  // 🔎 Catégories uniques triées
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      const c = (s.category ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [services]);

  // 🔎 Sous-catégories uniques triées (⚠️ globales, pas dépendantes de la catégorie)
  const subcategoriesAll = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      const sc = (s.subcategory ?? "").trim();
      if (sc) set.add(sc);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [services]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      setForm((f) => ({ ...f, [name]: files[0] as File })); // image
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
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

  // Flags “Autre…” (saisie libre)
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [useCustomSubcategory, setUseCustomSubcategory] = useState(false);

  // Sélecteurs “Autre…”
  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__custom__") {
      setUseCustomCategory(true);
      setForm((f) => ({ ...f, category: "" }));
    } else {
      setUseCustomCategory(false);
      setForm((f) => ({ ...f, category: v }));
    }
  };

  const handleSubcategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__custom__") {
      setUseCustomSubcategory(true);
      setForm((f) => ({ ...f, subcategory: "" }));
    } else {
      setUseCustomSubcategory(false);
      setForm((f) => ({ ...f, subcategory: v }));
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Créer une prestation</h2>

      {loadingMeta && (
        <p className="text-sm text-gray-500 mb-3">Chargement des catégories…</p>
      )}
      {errorMeta && <p className="text-sm text-red-600 mb-3">{errorMeta}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nom"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          name="duration"
          type="number"
          placeholder="Durée (min)"
          value={form.duration}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          name="price"
          placeholder="Prix"
          value={form.price}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        {/* Champ image */}
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {/* Sélecteur Catégorie (global) */}
        {!useCustomCategory ? (
          <div>
            <label className="block text-sm mb-1">Catégorie</label>
            <select
              name="category"
              value={form.category || ""}
              onChange={handleCategorySelect}
              className="border p-2 w-full bg-white"
              required
            >
              <option value="" disabled>
                — Choisir une catégorie —
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__custom__">Autre…</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-1">
              Catégorie (saisie libre)
            </label>
            <div className="flex gap-2">
              <input
                name="category"
                placeholder="Ex. Coiffure"
                value={form.category}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
              <button
                type="button"
                className="px-3 py-2 border rounded"
                onClick={() => {
                  setUseCustomCategory(false);
                  setForm((f) => ({ ...f, category: "" }));
                }}
                title="Revenir à la sélection"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Sélecteur Sous-catégorie (dupliqué : global, pas dépendant) */}
        {!useCustomSubcategory ? (
          <div>
            <label className="block text-sm mb-1">Sous-catégorie</label>
            <select
              name="subcategory"
              value={form.subcategory || ""}
              onChange={handleSubcategorySelect}
              className="border p-2 w-full bg-white"
              required
            >
              <option value="" disabled>
                — Choisir une sous-catégorie —
              </option>
              {subcategoriesAll.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
              <option value="__custom__">Autre…</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-1">
              Sous-catégorie (saisie libre)
            </label>
            <div className="flex gap-2">
              <input
                name="subcategory"
                placeholder="Ex. Tresses"
                value={form.subcategory}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              />
              <button
                type="button"
                className="px-3 py-2 border rounded"
                onClick={() => {
                  setUseCustomSubcategory(false);
                  setForm((f) => ({ ...f, subcategory: "" }));
                }}
                title="Revenir à la sélection"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/prestations")}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!form.category || !form.subcategory}
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePrestation;
