import React from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessPageOrder() {
  const navigate = useNavigate();

  return (
    <div className="mt-[150px] px-6 max-w-2xl mx-auto text-center">
      {/* Icône de succès */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <span className="text-2xl" role="img" aria-label="Succès">✅</span>
      </div>

      {/* Titre principal */}
      <h1 className="text-2xl font-bold mb-2">Paiement confirmé 🎉</h1>

      {/* Message principal */}
      <p className="text-gray-700 mb-2">
        Merci pour votre commande&nbsp;! Le paiement de votre commande a bien été confirmé.
      </p>
      <p className="text-gray-700">
        Un e-mail de confirmation vous a été envoyé avec tous les détails de votre commande.
      </p>

      {/* Boutons d'action */}
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
