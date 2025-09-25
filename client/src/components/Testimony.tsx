// src/components/Testimony.tsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Testimony: affiche le Trustpilot Reviews widget + un Review Collector.
 *
 * - Vérifie la présence du script global (index.html) sinon l'injecte.
 * - Réinitialise le widget quand l'utilisateur revient sur l'onglet.
 *
 * IMPORTANT: Remplace TEMPLATE_ID_REVIEW / TEMPLATE_ID_COLLECTOR / DATA_TOKEN_COLLECTOR
 * par les valeurs exactes fournies dans ton compte Trustpilot si nécessaire.
 */

// ---- CONFIG (remplace si besoin depuis ton dashboard Trustpilot) ----
// Template pour l'affichage des avis (reviews). Exemple que tu as mentionné plus haut:
const TEMPLATE_ID_REVIEW = "53aa8807dec7e10d38f59f36";

// Template pour le "Review Collector" (permet aux visiteurs d'envoyer un avis)
const TEMPLATE_ID_COLLECTOR = "56278e9abfbbba0bdcd568bc";
// Token fourni pour le collector (si fourni)
const DATA_TOKEN_COLLECTOR = "4c45da26-04cf-4f60-88e0-2b47f88ca5ee";

// business unit id
const BUSINESS_UNIT_ID = "68d4f8190cc45584c391486f";
// url publique review
const TRUSTPILOT_REVIEW_URL =
  "https://fr.trustpilot.com/review/eboutique-reconcil-beauty-afro.vercel.app";

// style height
const STYLE_HEIGHT = "320px";

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement?: (el: Element | null) => void;
    };
  }
}

export default function Testimony() {
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const collectorRef = useRef<HTMLDivElement | null>(null);
  const [loadingWidget, setLoadingWidget] = useState(true);
  const [noReviews, setNoReviews] = useState(false);

  useEffect(() => {
    let mounted = true;
    const SCRIPT_SRC =
      "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

    const init = () => {
      if (
        window.Trustpilot &&
        typeof window.Trustpilot.loadFromElement === "function"
      ) {
        try {
          // init both elements if present
          if (reviewRef.current)
            window.Trustpilot.loadFromElement(reviewRef.current);
          if (collectorRef.current)
            window.Trustpilot.loadFromElement(collectorRef.current);
        } catch (e) {
          // ignore
        }
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
          setTimeout(checkRendered, 1200);
        };
        document.head.appendChild(s);
      } else {
        setTimeout(() => {
          init();
          setLoadingWidget(false);
          setTimeout(checkRendered, 1200);
        }, 50);
      }
    };

    const checkRendered = () => {
      if (!mounted) return;
      const el = reviewRef.current;
      if (!el) {
        setNoReviews(true);
        return;
      }
      const text = el.innerText?.trim() ?? "";
      const hasIframe = !!el.querySelector("iframe");
      const hasChildren = el.children.length > 0;
      if ((!text || text.length < 20) && !hasIframe && !hasChildren) {
        setNoReviews(true);
      } else {
        setNoReviews(false);
      }
    };

    insertScriptIfNeeded();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        try {
          if (
            window.Trustpilot &&
            typeof window.Trustpilot.loadFromElement === "function"
          ) {
            if (reviewRef.current)
              window.Trustpilot.loadFromElement(reviewRef.current);
            if (collectorRef.current)
              window.Trustpilot.loadFromElement(collectorRef.current);
          } else {
            setTimeout(() => {
              if (
                window.Trustpilot &&
                typeof window.Trustpilot.loadFromElement === "function"
              ) {
                if (reviewRef.current)
                  window.Trustpilot.loadFromElement(reviewRef.current);
                if (collectorRef.current)
                  window.Trustpilot.loadFromElement(collectorRef.current);
              }
            }, 500);
          }
        } catch (e) {
          // noop
        }
        setTimeout(checkRendered, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
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
          onClick={() => {
            if (
              window.Trustpilot &&
              typeof window.Trustpilot.loadFromElement === "function"
            ) {
              try {
                if (reviewRef.current)
                  window.Trustpilot.loadFromElement(reviewRef.current);
              } catch {
                window.location.reload();
              }
            } else {
              window.location.reload();
            }
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Rafraîchir les avis
        </button>
      </div>

      {loadingWidget && (
        <div className="text-center text-slate-600 mb-4">
          Chargement des avis…
        </div>
      )}

      {!loadingWidget && noReviews && (
        <div className="max-w-3xl mx-auto text-center bg-white p-6 rounded-xl shadow mb-6">
          <p className="text-lg font-medium text-slate-800 mb-2">
            Aucun avis disponible pour le moment.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Soyez le premier à laisser un avis ! Cliquez sur « Donner votre avis
            ».
          </p>
          <button
            onClick={openTrustpilot}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            Donner mon avis
          </button>
        </div>
      )}

      {/* Reviews display widget */}
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

      {/* Review Collector: montre un petit collecteur / bouton (optionnel) */}
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

      <p className="text-center text-sm text-slate-500 mt-6 max-w-3xl mx-auto">
        Les avis sont gérés par Trustpilot. Pour modifier un avis existant,
        cliquez sur « Donner votre avis », connectez-vous sur Trustpilot,
        modifiez votre avis, puis revenez ici — le widget se mettra à jour
        automatiquement.
      </p>
    </section>
  );
}
