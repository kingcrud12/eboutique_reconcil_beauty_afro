import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

function CheckEmail() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => navigate("/shop/login"), 3000);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-white px-4">
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center max-w-md shadow-sm">
        <div className="w-14 h-14 rounded-full bg-sage-50 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-sage-600" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3">
          Merci pour votre inscription !
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Un e-mail de confirmation vient de vous être envoyé.
        </p>
        <p className="text-gray-400 text-sm">
          Veuillez cliquer sur le lien dans cet e-mail pour activer votre compte.
        </p>
      </div>
    </div>
  );
}

export default CheckEmail;
