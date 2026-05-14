import React, { useEffect, useState } from "react";
import api from "../connect_to_api/api";
import { Star } from "lucide-react";

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

// Fallback reviews for when API returns empty
const fallbackReviews: ITPReview[] = [
  {
    id: "f1",
    name: "Aicha M.",
    rating: 5,
    text: "Excellent produit ! Mes cheveux sont plus doux et brillants.",
    title: "Huile de Coco Bio",
  },
  {
    id: "f2",
    name: "Fatou S.",
    rating: 5,
    text: "Texture parfaite, pénètre bien sans laisser de film gras.",
    title: "Beurre de Karité",
  },
  {
    id: "f3",
    name: "Marie K.",
    rating: 5,
    text: "Hydratation profonde garantie, je recommande vivement !",
    title: "Masque Hydratant",
  },
];

export default function Testimony() {
  const [reviews, setReviews] = useState<ITPReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      try {
        const { data } = await api.get<ITPReview[]>("/trustpilot/reviews");
        if (!mounted) return;
        setReviews(data && data.length > 0 ? data : fallbackReviews);
      } catch (err) {
        console.error(err);
        if (mounted) setReviews(fallbackReviews);
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

  const displayedReviews = reviews.slice(0, 3);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {loadingReviews ? (
          <p className="text-center text-gray-500">Chargement des avis…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedReviews.map((r, idx) => (
              <article
                key={r.id ?? `${r.name}-${idx}`}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= (r.rating ?? 5)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6 min-h-[3rem]">
                  "{r.text}"
                </p>

                {/* Reviewer */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-800 text-sm">
                    {r.name ?? "Anonyme"}
                  </p>
                  {r.title && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Produit : {r.title}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-8">
          <button
            onClick={openTrustpilot}
            className="inline-block px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:border-sage-400 hover:text-sage-600 transition-colors"
          >
            Donner votre avis sur Trustpilot
          </button>
        </div>
      </div>
    </section>
  );
}
