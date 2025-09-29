import React, { useEffect, useState } from "react";
import api from "../connect_to_api/api";
import { User } from "lucide-react";

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement?: (el: Element | null) => void;
    };
  }
}

export interface ITPReview {
  id?: string;
  name: string | null;
  avatar?: string | null;
  country?: string | null;
  reviewsCount?: number | null;
  rating: number | null;
  date?: string | null;
  title?: string | null;
  text?: string | null;
  unprompted?: boolean;
}
const TRUSTPILOT_REVIEW_URL =
  "https://fr.trustpilot.com/review/eboutique-reconcil-beauty-afro.vercel.app";

export default function Testimony() {
  const [reviews, setReviews] = useState<ITPReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      try {
        const { data } = await api.get<ITPReview[]>("/trustpilot/reviews");
        if (!mounted) return;
        setReviews(data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };
    fetchReviews();
    return () => {
      mounted = false;
    };
  }, []);

  const openTrustpilot = () =>
    window.open(TRUSTPILOT_REVIEW_URL, "_blank", "noopener,noreferrer");

  return (
    <section className="py-16 px-4 bg-[#f0f9f5]">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-800">Ils ont apprécié</h2>
        <p className="text-slate-500 mt-2">Avis vérifiés via Trustpilot</p>
      </div>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <button
          onClick={openTrustpilot}
          className="bg-white border border-slate-300 px-4 py-2 rounded-lg shadow hover:shadow-md"
        >
          Donner votre avis
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Rafraîchir les avis
        </button>
      </div>

      {loadingReviews ? (
        <p className="text-center text-slate-600">Chargement des avis…</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-slate-600">
          Aucun avis disponible pour le moment.
        </p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <article
              key={r.id ?? `${r.name}-${r.date}`}
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              <header className="flex items-center mb-4">
                <User className="w-11 h-11 rounded-full mr-3" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {r.name ?? "Anonyme"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.country ?? "FR"} • {r.reviewsCount ?? 1} avis
                  </p>
                </div>
                <time className="ml-auto text-xs text-slate-400">
                  {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : ""}
                </time>
              </header>

              <div className="mb-3">
                {r.rating && (
                  <img
                    src={`https://cdn.trustpilot.net/brand-assets/4.1.0/stars/stars-${r.rating}.svg`}
                    alt={`Noté ${r.rating} sur 5`}
                    className="h-5"
                  />
                )}
              </div>

              {r.title && <h3 className="font-medium mb-2">{r.title}</h3>}
              {r.text && <p className="text-slate-700 flex-1">{r.text}</p>}

              {r.unprompted && (
                <span className="mt-2 inline-block bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                  Avis spontané
                </span>
              )}

              <div className="mt-4 flex gap-2">
                <button className="text-xs text-slate-500 hover:underline">
                  Utile
                </button>
                <button className="text-xs text-slate-500 hover:underline">
                  Partager
                </button>
                <button className="text-xs text-slate-500 hover:underline">
                  Signaler
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
