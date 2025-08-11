import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id") ?? undefined;

  return (
    <div className="mt-[150px] px-6 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <span className="text-2xl" role="img" aria-label="Succès">✅</span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Paiement réussi 🎉</h1>
      <p className="text-gray-700">
        Merci ! Votre paiement a été confirmé. Votre commande passe en statut <b>paid</b>.
      </p>

      {sessionId && (
        <p className="text-xs text-gray-500 mt-2">
          ID de session Stripe : <code>{sessionId}</code>
        </p>
      )}

      <div className="mt-6 flex items-center gap-3 justify-center">
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Voir mes commandes
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Continuer mes achats
        </button>
      </div>
    </div>
  );
}
