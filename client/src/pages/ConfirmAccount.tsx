import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../connect_to_api/api";
import { UserCheck } from "lucide-react";

function ConfirmAccount() {
  const [message, setMessage] = useState("Confirmation en cours...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Lien invalide ou expiré.");
      return;
    }

    api.patch(`/auth/confirm-account?token=${token}`)
      .then(() => {
        setMessage("Votre compte a bien été confirmé !");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch(() => {
        setMessage("Erreur lors de la confirmation du compte.");
      });
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-white px-4">
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center max-w-md shadow-sm">
        <div className="w-14 h-14 rounded-full bg-sage-50 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-6 h-6 text-sage-600" />
        </div>
        <h1 className="text-xl font-serif font-bold text-gray-800 mb-3">
          Confirmation du compte
        </h1>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

export default ConfirmAccount;
