import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 max-w-lg mx-auto text-center py-20">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3">
        Paiement annulé
      </h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        Votre paiement a été annulé. Aucun montant n'a été débité. Vous pouvez réessayer à tout moment.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2.5 bg-sage-600 text-white rounded-lg text-sm font-medium hover:bg-sage-700 transition-colors"
      >
        Retour à la boutique
      </button>
    </div>
  );
};

export default CancelPage;
