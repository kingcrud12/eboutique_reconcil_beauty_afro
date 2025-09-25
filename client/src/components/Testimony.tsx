// Testimony.tsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Composant minimal pour afficher Trustpilot reviews uniquement.
 * - Affiche TrustBox (widget officiel)
 * - Si le widget ne rend rien après un délai, affiche "Aucun avis pour le moment"
 * - Bouton "Laisser / éditer sur Trustpilot" ouvre Trustpilot dans un nouvel onglet
 * - Quand l'utilisateur revient sur l'onglet (visibilitychange), on ré-initialise le widget
 *
 * Remplace BUSINESS_UNIT_ID et REVIEW_URL par tes valeurs Trustpilot.
 */

// ==== CONFIG ====
// business unit id fourni par Trustpilot (remplace par le tien)
const BUSINESS_UNIT_ID = "68d4f8190cc45584c391486f";
// url publique de la page review sur Trustpilot (où l'utilisateur peut laisser/éditer son avis)
const TRUSTPILOT_REVIEW_URL =
  "https://fr.trustpilot.com/review/eboutique-reconcil-beauty-afro.vercel.app";
// template id — choisis un template "reviews" depuis Trustpilot, ici un template d'exemple
const TEMPLATE_ID = "53aa8807dec7e10d38f59f36";
// style height for the TrustBox
const STYLE_HEIGHT = "320px";

// ==== types pour window.Trustpilot (TS) ====
declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement?: (el: Element | null) => void;
    };
  }
}

export default function Testimony() {
  const trustboxRef = useRef<HTMLDivElement | null>(null);
  const [loadingWidget, setLoadingWidget] = useState(true);
  const [noReviews, setNoReviews] = useState(false);

  useEffect(() => {
    let mounted = true;
    const SCRIPT_SRC =
      "//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

    const initWidget = () => {
      // si la lib est dispo, on appelle la méthode d'init (si fournie)
      if (
        window.Trustpilot &&
        typeof window.Trustpilot.loadFromElement === "function"
      ) {
        try {
          window.Trustpilot.loadFromElement(trustboxRef.current);
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
          initWidget();
          setLoadingWidget(false);
          // après init, vérifie si le widget a rendu du contenu
          setTimeout(checkRendered, 1200);
        };
        document.head.appendChild(s);
      } else {
        // script déjà présent
        setTimeout(() => {
          initWidget();
          setLoadingWidget(false);
          setTimeout(checkRendered, 1200);
        }, 50);
      }
    };

    // fonction qui regarde si le TrustBox a rendu quelque chose
    const checkRendered = () => {
      if (!mounted) return;
      const el = trustboxRef.current;
      if (!el) {
        setNoReviews(true);
        return;
      }
      // heuristique : si innerText vide ou trop court → aucun avis visible
      const text = el.innerText?.trim() ?? "";
      // si le widget utilise iframe, innerText peut être vide mais le iframe présent => on checke presence d'iframe ou d'enfants
      const hasIframe = !!el.querySelector("iframe");
      const hasChildren = el.children.length > 0;
      if ((!text || text.length < 20) && !hasIframe && !hasChildren) {
        setNoReviews(true);
      } else {
        setNoReviews(false);
      }
    };

    insertScriptIfNeeded();

    // quand l'utilisateur revient sur la page (après édition sur Trustpilot), on ré-init le widget
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // réinitialiser le TrustBox sans faire un reload complet
        if (
          window.Trustpilot &&
          typeof window.Trustpilot.loadFromElement === "function"
        ) {
          try {
            window.Trustpilot.loadFromElement(trustboxRef.current);
          } catch (e) {
            // noop
          }
        } else {
          // si la lib n'est pas prête, on réessaye après un court délai
          setTimeout(() => {
            if (
              window.Trustpilot &&
              typeof window.Trustpilot.loadFromElement === "function"
            ) {
              window.Trustpilot.loadFromElement(trustboxRef.current);
            }
          }, 500);
        }
        // re-vérifier le rendu après un court délai
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
    // Ouvre Trustpilot dans un nouvel onglet — l'utilisateur peut éditer là-bas.
    // Quand il revient, notre listener visibilitychange ré-initialisera le widget.
    window.open(TRUSTPILOT_REVIEW_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bg-[#f0f9f5] py-16 px-4">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-800">Ils ont adoré</h2>
        <p className="text-slate-500 mt-2">Avis vérifiés via Trustpilot</p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={openTrustpilot}
          className="bg-white border border-slate-300 px-4 py-2 rounded-lg shadow hover:shadow-md"
        >
          éditer sur Trustpilot
        </button>

        <button
          onClick={() => {
            // si la lib est présente, on recharge juste l'élément
            if (
              window.Trustpilot &&
              typeof window.Trustpilot.loadFromElement === "function"
            ) {
              try {
                window.Trustpilot.loadFromElement(trustboxRef.current);
              } catch {
                // fallback: full reload
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

      {/* Message pendant le chargement ou si pas d'avis */}
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
            Soyez le premier à laisser un avis ! Cliquez sur « Laisser / éditer
            sur Trustpilot » pour écrire votre avis.
          </p>
          <button
            onClick={openTrustpilot}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            Donner mon avis
          </button>
        </div>
      )}

      {/* TrustBox widget */}
      <div className="max-w-6xl mx-auto">
        <div
          ref={trustboxRef}
          className="trustpilot-widget"
          style={{ width: "100%", height: STYLE_HEIGHT }}
          data-locale="fr-FR"
          data-template-id={TEMPLATE_ID}
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

      <p className="text-center text-sm text-slate-500 mt-6 max-w-3xl mx-auto">
        Les avis sont gérés par Trustpilot. Pour modifier un avis existant,
        cliquez sur « Laisser / éditer sur Trustpilot », connectez-vous sur
        Trustpilot, modifiez votre avis, puis revenez ici — le widget se mettra
        à jour automatiquement lorsque vous reviendrez sur la page.
      </p>
    </section>
  );
}
