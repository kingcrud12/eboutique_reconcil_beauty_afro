import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

type SlotDTO = {
  id: number;
  serviceId: number;
  startAt: string; // ISO UTC
  endAt: string;   // ISO UTC
  status: "open" | "booked" | "cancelled";
  service?: { id: number; name: string } | null;
};

function fromIsoToLocalParts(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`,
  };
}

function toUtcISOStringFromLocal(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

export default function SlotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [slot, setSlot] = useState<SlotDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startParts = useMemo(
    () => (slot ? fromIsoToLocalParts(slot.startAt) : { date: "", time: "" }),
    [slot]
  );
  const endParts = useMemo(
    () => (slot ? fromIsoToLocalParts(slot.endAt) : { date: "", time: "" }),
    [slot]
  );

  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<SlotDTO>(`/slots/${id}`);
        if (!mounted) return;
        setSlot(res.data);
      } catch (e: any) {
        setErr(e?.response?.data?.message ?? "Impossible de charger le créneau.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!slot) return;
    setDate(startParts.date);
    setStartTime(startParts.time);
    setEndTime(endParts.time);
  }, [slot, startParts, endParts]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      setErr("Veuillez compléter la date et les heures.");
      return;
    }
    setSaving(true);
    setErr(null);

    try {
      const startAt = toUtcISOStringFromLocal(date, startTime);
      const endAt = toUtcISOStringFromLocal(date, endTime);

      await api.put(`/slots/${id}`, { startAt, endAt });
      navigate("/availibilities");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Échec de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!slot) return <div className="p-6">Créneau introuvable.</div>;

  return (
    <div className="p-6 max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-600 hover:underline"
      >
        ← Retour
      </button>

      <h1 className="text-xl font-semibold mb-4">
        Détail du créneau #{slot.id}
      </h1>

      <div className="mb-4 text-sm text-gray-700">
        <div>Service : {slot.service?.name ?? `#${slot.serviceId}`}</div>
        <div>
          Statut :{" "}
          {slot.status === "open"
            ? "libre"
            : slot.status === "booked"
            ? "réservé"
            : "annulé"}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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

        <div className="text-xs text-gray-600">
          <div>
            Début local : {date && startTime ? new Date(`${date}T${startTime}:00`).toLocaleString("fr-FR") : "-"}
            {"  "}→ UTC envoyé : {date && startTime ? new Date(`${date}T${startTime}:00`).toISOString() : "-"}
          </div>
          <div>
            Fin locale : {date && endTime ? new Date(`${date}T${endTime}:00`).toLocaleString("fr-FR") : "-"}
            {"  "}→ UTC envoyé : {date && endTime ? new Date(`${date}T${endTime}:00`).toISOString() : "-"}
          </div>
        </div>

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
