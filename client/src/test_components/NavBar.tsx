/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((s) => !s);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: '"Pacifico", serif' }}
            >
              AfroHair
            </h1>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer">
                Accueil
              </a>
              <a className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer">
                Produits
              </a>
              <a className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer">
                À propos
              </a>
              <a className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer">
                Contact
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 cursor-pointer">
              <i className="ri-search-line text-xl w-5 h-5 flex items-center justify-center"></i>
            </button>
            <button className="text-gray-600 hover:text-gray-900 cursor-pointer">
              <i className="ri-shopping-cart-line text-xl w-5 h-5 flex items-center justify-center"></i>
            </button>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 whitespace-nowrap cursor-pointer">
              Connexion
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <i
                className={`${
                  isMenuOpen ? "ri-close-line" : "ri-menu-line"
                } text-xl w-6 h-6 flex items-center justify-center`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
            <a className="text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer">
              Accueil
            </a>
            <a className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer">
              Produits
            </a>
            <a className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer">
              À propos
            </a>
            <a className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer">
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
