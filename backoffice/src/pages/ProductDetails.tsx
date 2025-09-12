import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { IProduct } from "../api/product.interfaces";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    weight: "" as unknown as number,
    category: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    api
      .get(`/products/${productId}`)
      .then((res) => {
        setProduct(res.data);
        setForm({
          name: res.data.name ?? "",
          description: res.data.description ?? "",
          price: String(res.data.price ?? ""),
          stock: String(res.data.stock ?? ""),
          weight: Number(res.data.weight ?? ""),
          category: res.data.category ?? "",
          imageUrl: res.data.imageUrl ?? "",
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Dès qu'on choisit un fichier, on envoie un PATCH multipart vers /products/:id
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!productId || !file) return;

    // prévisualisation instantanée
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);

      const res = await api.patch<IProduct>(`/products/${productId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data;
      if (updated?.imageUrl) {
        setForm((f) => ({ ...f, imageUrl: updated.imageUrl }));
        setProduct((p) => (p ? { ...p, imageUrl: updated.imageUrl } : p));
      } else {
        // Au cas où l’API ne renvoie pas l’URL, on refetch
        const refetched = await api.get<IProduct>(`/products/${productId}`);
        setProduct(refetched.data);
        setForm((f) => ({
          ...f,
          imageUrl: refetched.data.imageUrl ?? f.imageUrl,
        }));
      }
    } catch (err) {
      console.error("Erreur lors du changement d'image :", err);
      alert("Impossible de mettre à jour l'image pour le moment.");
      // annule la preview si échec
      URL.revokeObjectURL(blobUrl);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!productId) return;
    try {
      await api.patch(`/products/${productId}`, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category: form.category || undefined,
        // imageUrl non envoyé ici : l’image est gérée via le PATCH multipart ci-dessus
      });
      alert("Produit mis à jour avec succès !");
      navigate("/products");
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      alert("Mise à jour impossible pour le moment.");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!product)
    return <div className="p-6 text-red-600">Produit introuvable</div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Détail du produit</h2>

      <div className="space-y-4">
        {/* Image + input fichier (sans bouton dédié) */}
        <div className="flex items-start gap-4">
          <img
            src={imagePreview || form.imageUrl || product.imageUrl}
            alt={form.name || product.name}
            className="w-40 h-40 object-cover rounded border bg-white"
          />
          <div className="flex-1 space-y-2">
            <label className="block font-medium">Changer l’image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploading}
              className="block w-full text-sm"
            />
            {uploading && (
              <p className="text-xs text-gray-500">Téléversement en cours…</p>
            )}
            {form.imageUrl && (
              <p className="text-xs text-gray-500 break-all">
                URL actuelle : {form.imageUrl}
              </p>
            )}
          </div>
        </div>

        {/* Champs texte */}
        <div className="space-y-2">
          <label className="block font-medium">Nom</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Prix (€)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Poids</label>
            <input
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Catégorie (optionnel)</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={handleUpdate}
            className="px-6 py-2 rounded text-white bg-gray-900"
          >
            ✅ Mettre à jour
          </button>

          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white px-4 py-2 rounded"
          >
            ⬅️ Retour
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
