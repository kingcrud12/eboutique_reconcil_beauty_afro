import React, { useEffect, useRef, useState } from "react";
import api from "../connect_to_api/api"; // ton intercepteur Axios

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement?: (el: Element | null) => void;
    };
  }
}

const TEMPLATE_ID_REVIEW = "53aa8807dec7e10d38f59f36";
const TEMPLATE_ID_COLLECTOR = "56278e9abfbbba0bdcd568bc";
const DATA_TOKEN_COLLECTOR = "4c45da26-04cf-4f60-88e0-2b47f88ca5ee";
const BUSINESS_UNIT_ID = "68d4f8190cc45584c391486f";
const TRUSTPILOT_REVIEW_URL =
  "https://fr.trustpilot.com/review/eboutique-reconcil-beauty-afro.vercel.app";
const STYLE_HEIGHT = "320px";

export interface ITPReview {
  name: string | null;
  rating: number | null;
  date?: string | null;
  text?: string | null;
  id?: string | null;
}

export default function Testimony() {
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const collectorRef = useRef<HTMLDivElement | null>(null);

  const [loadingWidget, setLoadingWidget] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [noReviews, setNoReviews] = useState(false);
  const [reviews, setReviews] = useState<ITPReview[]>([]);

  // --- Widget Trustpilot ---
  useEffect(() => {
    let mounted = true;
    const SCRIPT_SRC =
      "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

    const init = () => {
      if (
        window.Trustpilot &&
        typeof window.Trustpilot.loadFromElement === "function"
      ) {
        if (reviewRef.current)
          window.Trustpilot.loadFromElement(reviewRef.current);
        if (collectorRef.current)
          window.Trustpilot.loadFromElement(collectorRef.current);
      }
    };

    const insertScriptIfNeeded = () => {
      if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.onload = () => {
          if (!mounted) return;
          init();
          setLoadingWidget(false);
        };
        document.head.appendChild(s);
      } else {
        setTimeout(() => {
          init();
          setLoadingWidget(false);
        }, 50);
      }
    };

    insertScriptIfNeeded();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Récupération des avis via API back ---
  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const { data } = await api.get<ITPReview[]>("/trustpilot/reviews"); // adapte la route si besoin
        if (!mounted) return;
        if (data && data.length > 0) {
          setReviews(data);
          setNoReviews(false);
        } else {
          setNoReviews(true);
        }
      } catch (err) {
        console.error("Erreur récupération avis Trustpilot", err);
        setNoReviews(true);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };

    fetchReviews();

    return () => {
      mounted = false;
    };
  }, []);

  const openTrustpilot = () => {
    window.open(TRUSTPILOT_REVIEW_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bg-[#f0f9f5] py-16 px-4">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-slate-800">Ils ont adoré</h2>
        <p className="text-slate-500 mt-2">Avis vérifiés via Trustpilot</p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
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

      {(loadingWidget || loadingReviews) && (
        <div className="text-center text-slate-600 mb-4">
          Chargement des avis…
        </div>
      )}

      {!loadingReviews && noReviews && (
        <div className="max-w-3xl mx-auto text-center bg-white p-6 rounded-xl shadow mb-6">
          <p className="text-lg font-medium text-slate-800 mb-2">
            Aucun avis disponible pour le moment.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Soyez le premier à laisser un avis !
          </p>
          <button
            onClick={openTrustpilot}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            Donner mon avis
          </button>
        </div>
      )}

      {!loadingReviews && reviews.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.map((r) => (
            <div
              key={r.id ?? `${r.name}-${r.date}`}
              className="bg-white p-4 rounded-lg shadow"
            >
              <p className="font-semibold">{r.name ?? "Anonyme"}</p>
              <p className="text-yellow-500 mb-2">
                {"⭐".repeat(r.rating ?? 0)}
              </p>
              <p className="text-sm text-slate-500 mb-2">{r.date}</p>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Widget Trustpilot */}
      <div className="max-w-6xl mx-auto mb-8">
        <div
          ref={reviewRef}
          className="trustpilot-widget"
          style={{ width: "100%", height: STYLE_HEIGHT }}
          data-locale="fr-FR"
          data-template-id={TEMPLATE_ID_REVIEW}
          data-businessunit-id={BUSINESS_UNIT_ID}
          data-style-height={STYLE_HEIGHT}
          data-style-width="100%"
        >
          <a
            href={TRUSTPILOT_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir les avis sur Trustpilot
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div
          ref={collectorRef}
          className="trustpilot-widget"
          data-locale="fr-FR"
          data-template-id={TEMPLATE_ID_COLLECTOR}
          data-businessunit-id={BUSINESS_UNIT_ID}
          data-style-height="52px"
          data-style-width="100%"
          data-token={DATA_TOKEN_COLLECTOR}
        >
          <a
            href={TRUSTPILOT_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Laisser un avis sur Trustpilot
          </a>
        </div>
      </div>
    </section>
  );
}
