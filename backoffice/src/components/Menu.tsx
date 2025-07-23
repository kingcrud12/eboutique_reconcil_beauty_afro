import React from "react";
import {
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Info,
  Archive,
  Calendar,
  Scissors
} from "lucide-react";
import { Link } from "react-router-dom";

function Menu() {
  return (
    <div className="bg-slate-900 text-white w-[240px] min-h-screen py-6 px-4 flex flex-col justify-between">
      
      {/* LOGO */}
      <div className="mb-2">
        <img src="/AM_LOGO.png" alt="Logo" className="text-xl font-bold text-center text-pink-400 mt-[-60px]" />
        <p className="text-xs text-center text-gray-300 mt-[-50px] mb-[-120px]">Reconcil' Afro beauty back office</p>
      </div>

      {/* MENU PRINCIPAL */}
      <nav className="space-y-[50px] mt-[140px]">
        <Link to="/Customers" className="flex items-center gap-2 hover:text-pink-400">
          <Users className="w-5 h-5" />
          Clients
        </Link>

        <Link to="/Orders" className="flex items-center gap-2 hover:text-pink-400">
          <ShoppingCart className="w-5 h-5" />
          Commandes
        </Link>

        <Link to="/Products" className="flex items-center gap-2 hover:text-pink-400">
          <Archive className="w-5 h-5" />
          Catalogue produits
        </Link>

        <Link to="/Availabilities" className="flex items-center gap-2 hover:text-pink-400">
          <Calendar className="w-5 h-5" />
          Disponibilités
        </Link>

        <Link to="/Prestations" className="flex items-center gap-2 hover:text-pink-400">
          <Scissors className="w-5 h-5" />
          Prestations coiffures
        </Link>

        <Link to="/Settings" className="flex items-center gap-2 hover:text-pink-400">
          <Settings className="w-5 h-5" />
          Paramètres
        </Link>

        <Link to="/Informations" className="flex items-center gap-2 hover:text-pink-400">
          <Info className="w-5 h-5" />
          Informations
        </Link>
      </nav>

      {/* DÉCONNEXION */}
      <div className="mt-10">
        <button className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Menu;
