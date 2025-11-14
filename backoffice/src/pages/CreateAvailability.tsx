import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

type ServiceLite = {
  id: number;
  name: string;
  duration: number;
  price: string | number;
};

function toUtcISOStringFromLocal(dateStr: string, timeStr: string) {
  // Construit une date locale → convertit en ISO UTC pour l’API
  // dateStr: "YYYY-MM-DD", timeStr: "HH:MM"
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return local.toISOString();
}

export default function CreateAvailability() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [serviceId, setServiceId] = useState<number | "">("");
  const [date, setDate] = useState<string>("");       // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>(""); // HH:MM
  const [endTime, setEndTime] = useState<string>("");     // HH:MM

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<ServiceLite[]>("/services");
        if (!mounted) return;
        setServices(res.data ?? []);
      } catch (e: any) {
        setErr(e?.response?.data?.message ?? "Impossible de charger les services.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !date || !startTime || !endTime) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }
    setSaving(true);
    setErr(null);

    try {
      const startAt = toUtcISOStringFromLocal(date, startTime);
      const endAt = toUtcISOStringFromLocal(date, endTime);

      await api.post("/slots", {
        serviceId: Number(serviceId),
        startAt,
        endAt,
      });

      navigate("/Availabilities");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Échec de la création du créneau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-600 hover:underline"
      >
        ← Retour
      </button>

      <h1 className="text-xl font-semibold mb-4">Créer un créneau</h1>

      {loading && <p>Chargement…</p>}
      {err && <p className="text-red-600 mb-3">{err}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Service</label>
          <select
            className="w-full border rounded p-2"
            value={serviceId}
            onChange={(e) =>
              setServiceId(e.target.value ? Number(e.target.value) : "")
            }
            required
          >
            <option value="">— Sélectionner —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                #{s.id} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Date (locale)</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Début (heure locale)</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Fin (heure locale)</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Aperçu local → UTC affiché pour clarté */}
        {date && startTime && endTime && (
          <div className="text-xs text-gray-600">
            <div>
              Début local : {new Date(`${date}T${startTime}:00`).toLocaleString("fr-FR")}
              {"  "}→ envoyé en UTC :{" "}
              {new Date(`${date}T${startTime}:00`).toISOString()}
            </div>
            <div>
              Fin locale : {new Date(`${date}T${endTime}:00`).toLocaleString("fr-FR")}
              {"  "}→ envoyé en UTC :{" "}
              {new Date(`${date}T${endTime}:00`).toISOString()}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Création…" : "Créer"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => navigate("/Availabilities")}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
