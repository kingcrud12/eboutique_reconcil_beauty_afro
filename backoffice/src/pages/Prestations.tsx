import React, { useEffect, useState, useCallback } from "react";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

type ServiceRow = {
  id: number;
  name: string;
  duration: number;
  price: string | number;
  imageUrl?: string | null;
  category: string;
  subcategory: string;
};

function Prestations() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceColumns = [
    { label: "Image", field: "image" },
    { label: "Nom", field: "name" },
    { label: "Prix", field: "price" },
    { label: "Durée", field: "duration" },
    { label: "Catégorie", field: "category" },
    { label: "Sous-catégorie", field: "subcategory" },
    { label: "Actions", field: "actions" },
  ];

  const translateCategory = (cat: string) => {
    const map: Record<string, string> = {
      Nattes: "Nattes",
      Braids: "Braids",
      Ecailles: "Écailles",
      Knotless: "Knotless",
      Cornrows: "Cornrows",
    };
    return map[cat] ?? cat;
  };

  const translateSubcategory = (sub: string) => {
    const map: Record<string, string> = {
      NATTES_COLLEES: "Nattes collées",
      KNOTLESS_CLASSIQUE: "Knotless classique",
      KNOTLESS_MODERNE: "Knotless moderne",
      CORNROWS_SIMPLE: "Cornrows (simple)",
    };
    return map[sub] ?? sub;
  };

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<ServiceRow[]>("/services");
      const mapped = res.data.map((srv) => ({
        image: (
          <img
            src={srv.imageUrl || "/placeholder.png"}
            alt={srv.name}
            className="w-10 h-10 rounded object-cover"
          />
        ),
        name: srv.name,
        price: `${Number(srv.price)} €`,
        duration: `${srv.duration} min`,
        category: translateCategory(srv.category),
        subcategory: translateSubcategory(srv.subcategory),
        actions: (
          <div className="flex space-x-2">
            <button
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
              onClick={() => navigate(`/services/${srv.id}`)}
            >
              Détails
            </button>
            <button
              className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
              onClick={() => setToDeleteId(srv.id)}
            >
              Supprimer
            </button>
          </div>
        ),
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Impossible de charger les services.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/services/${toDeleteId}`);
      setToDeleteId(null);
      await fetchServices();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Suppression impossible.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Prestations coiffures</h2>
        <button
          onClick={() => navigate("/create-prestation")}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Ajouter une prestation
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p>Chargement…</p>
      ) : (
        <DataTable columns={serviceColumns} data={rows} />
      )}

      {/* Modal confirmation suppression */}
      {toDeleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600">
              Es-tu sûr de vouloir supprimer ce service ? Cette action est irréversible.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setToDeleteId(null)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prestations;
