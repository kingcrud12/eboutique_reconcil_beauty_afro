import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

type ServicePayload = {
  id: number;
  name: string;
  duration: number;
  price: string | number;
  imageUrl?: string | null;
  category: string;
  subcategory: string;
};

const enumCategoryOptions = [
  "Nattes",
  "Braids",
  "Ecailles",
  "Knotless",
  "Cornrows",
];
const enumSubcategoryOptions = [
  "NATTES_COLLEES",
  "KNOTLESS_CLASSIQUE",
  "KNOTLESS_MODERNE",
  "CORNROWS_SIMPLE",
];

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ServicePayload>({
    id: 0,
    name: "",
    duration: 60,
    price: "0",
    imageUrl: "",
    category: "Nattes",
    subcategory: "NATTES_COLLEES",
  });

  // ⬇️ état pour l’upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<ServicePayload>(`/services/${id}`);
        if (!mounted) return;
        const srv = res.data;
        setForm({
          ...srv,
          price: typeof srv.price === "number" ? String(srv.price) : srv.price,
          imageUrl: srv.imageUrl ?? "",
        });
        setPreview(srv.imageUrl ?? null);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ?? "Impossible de charger le service."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "duration" ? Number(value) || 0 : value,
    }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(form.imageUrl ?? null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (file) {
        // ⚙️ envoi multipart/form-data quand un fichier est choisi
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("duration", String(form.duration));
        fd.append("price", String(form.price)); // le backend attend un décimal en string
        if (form.category) fd.append("category", form.category);
        if (form.subcategory) fd.append("subcategory", form.subcategory);
        fd.append("image", file); // 🔑 même clé que côté create (image)

        await api.patch(`/services/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // ⚙️ pas d’upload → JSON classique
        const payload = {
          name: form.name,
          duration: Number(form.duration),
          price: String(form.price),
          imageUrl: form.imageUrl || undefined, // conserve l’URL existante si pas d’upload
          category: form.category,
          subcategory: form.subcategory,
        };
        await api.patch(`/services/${id}`, payload);
      }

      navigate("/prestations");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Échec de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-600 hover:underline"
      >
        ← Retour
      </button>

      <h1 className="text-xl font-semibold mb-4">
        Détail du service #{form.id}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full border rounded p-2"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Durée (minutes)</label>
          <input
            name="duration"
            type="number"
            min={1}
            value={form.duration}
            onChange={onChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Prix (€)</label>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={onChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* URL existante (optionnelle) */}
        <div>
          <label className="block text-sm mb-1">Image (URL existante)</label>
          <input
            name="imageUrl"
            value={form.imageUrl ?? ""}
            onChange={onChange}
            className="w-full border rounded p-2"
            placeholder="https://…"
          />
        </div>

        {/* Upload d’une nouvelle image */}
        <div>
          <label className="block text-sm mb-1">Remplacer par un fichier</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="w-full"
          />
          {preview ? (
            <img
              src={preview}
              alt={form.name}
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          ) : null}
          <p className="text-xs text-gray-500 mt-1">
            Si un fichier est sélectionné, il remplacera l’image actuelle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Catégorie</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full border rounded p-2"
              required
            >
              {enumCategoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Sous-catégorie</label>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={onChange}
              className="w-full border rounded p-2"
              required
            >
              {enumSubcategoryOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/prestations")}
            className="px-4 py-2 rounded border"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
