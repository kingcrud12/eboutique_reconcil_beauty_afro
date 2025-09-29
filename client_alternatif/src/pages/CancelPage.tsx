import React from "react";
import { useNavigate } from "react-router-dom";

export default function CancelPage() {
  const navigate = useNavigate();

  return (
    <div className="mt-[150px] px-6 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
        <span className="text-2xl" role="img" aria-label="Annulé">⚠️</span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Paiement annulé</h1>
      <p className="text-gray-700">
        Votre paiement a été annulé. Vous pouvez réessayer ou revenir à vos commandes.
      </p>

      <div className="mt-6 flex items-center gap-3 justify-center">
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Retour à mes commandes
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
