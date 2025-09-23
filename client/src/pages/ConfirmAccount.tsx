import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";

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

    api
      .patch(`/auth/confirm-account?token=${token}`)
      .then(() => {
        setMessage("Votre compte a bien été confirmé !");
        setTimeout(() => {
          navigate("/login");
        }, 3000); // redirection après 3 secondes
      })
      .catch(() => {
        setMessage("Erreur lors de la confirmation du compte.");
      });
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded shadow-md max-w-md text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-4">
          Confirmation du compte
        </h1>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default ConfirmAccount;
