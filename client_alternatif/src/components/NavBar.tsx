/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ShoppingCart, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuth();
  const { totalQuantity, fetchCart, setCarts } = useCart();

  // Gestion du click en dehors du menu utilisateur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recharge du panier à l'authentification
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = () => {
    logout();
    setCarts([]);
    window.dispatchEvent(new Event("cart:clear"));
    setUserModalOpen(false);
  };

  const handleLoginRedirect = () => {
    setUserModalOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-center">
              <img
                src="/AM_LOGO.png"
                alt="Logo"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap"
              to="/"
            >
              Accueil
            </Link>
            <Link
              className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap"
              to="/products"
            >
              Produits
            </Link>
            <Link
              className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap"
              to="/appointment"
            >
              Services
            </Link>
            <Link
              className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap"
              to="/"
            >
              Contact
            </Link>
          </div>

          {/* Actions utilisateur et panier */}
          <div
            className="hidden md:flex items-center space-x-24 relative"
            ref={userRef}
          >
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">
                  {totalQuantity}
                </span>
              )}
            </div>

            <User
              className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer"
              onClick={() => setUserModalOpen(!userModalOpen)}
            />

            {userModalOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow-lg z-50 py-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setUserModalOpen(false)}
                    >
                      Mon compte
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={handleLoginRedirect}
                  >
                    Connexion
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Burger menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <Menu
                className={`${
                  isMenuOpen ? "ri-close-line" : "ri-menu-line"
                } text-xl w-6 h-6 flex items-center justify-center`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
          <Link
            to="/"
            className="block text-gray-900 px-3 py-2 text-base font-medium"
          >
            Accueil
          </Link>
          <Link
            to="/"
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium"
          >
            Produits
          </Link>
          <Link
            to="/products"
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium"
          >
            Services
          </Link>
          <Link
            to="/appointment"
            className="block text-gray-600 hover:text-gray-900 px-3 py-2 text-base font-medium"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}
