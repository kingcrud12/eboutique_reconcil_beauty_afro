import React from "react";
import { User, MapPin, PackageCheck, Clock } from "lucide-react";

const Account = () => {
  const user = {
    firstName: "Yann",
    lastName: "Dipita",
    email: "yann@example.com",
    time: new Date().toLocaleTimeString(),
  };

  return (
    <div className="mt-[90px] px-4 py-10 bg-white text-slate-800 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Bienvenue {user.firstName} !</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Carte utilisateur */}
          <div className="bg-slate-100 p-6 rounded-xl shadow-md w-full md:w-1/3">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-slate-300 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-lg">{user.firstName} {user.lastName}</p>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  {user.time}
                </div>
              </div>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 hover:underline cursor-pointer">
                <User className="w-4 h-4" />
                Mon compte
              </li>
              <li className="flex items-center gap-2 hover:underline cursor-pointer">
                <MapPin className="w-4 h-4" />
                Mes adresses de livraison
              </li>
              <li className="flex items-center gap-2 hover:underline cursor-pointer">
                <PackageCheck className="w-4 h-4" />
                Mes commandes
              </li>
            </ul>
          </div>

          {/* Contenu principal (placeholder) */}
          <div className="flex-1 bg-slate-50 border rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">Vos informations de compte et historique apparaîtront ici.</p>
            <div className="mt-10">
              <img
                src="/empty-box.svg"
                alt="Rien à afficher"
                className="mx-auto w-28 opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
