// src/pages/CheckEmail.tsx
import React from "react";

function CheckEmail() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Merci pour votre inscription !
        </h1>
        <p className="text-gray-700 mb-2">
          Un e-mail de confirmation vient de vous être envoyé.
        </p>
        <p className="text-gray-600">
          Veuillez cliquer sur le lien dans cet e-mail pour activer votre compte.
        </p>
      </div>
    </div>
  );
}

export default CheckEmail;
