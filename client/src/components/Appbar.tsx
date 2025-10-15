import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ShoppingCart, Menu, Facebook, Instagram, Youtube } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

function Appbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuth();
  const { totalQuantity, fetchCart, setCarts } = useCart();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = () => {
    setCarts([]);
    window.dispatchEvent(new Event("cart:clear"));

    logout();
    setUserModalOpen(false);

    navigate("/");
  };

  const handleLoginRedirect = () => {
    setUserModalOpen(false);
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 shadow">
      {/* Super header */}
      <div className="w-full bg-[#1f2023] text-[#c2a63b] text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:opacity-80">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-80">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:opacity-80">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span> +33 6 28 48 56 37</span>
            <span className="opacity-60">|</span>
            <a href="mailto:info@lafrobeauty.com" className="hover:underline">
              reconcilafrobeauty@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Main appbar */}
      <div className="w-full bg-white text-black px-4 py-2 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <Link to="/" className="flex flex-col items-center">
          <img src="/AM_LOGO.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
          <p className="text-[10px] sm:text-xs leading-none">
            Réconcil' Afro Beauty
          </p>
        </Link>

        <div className="flex items-center gap-4 relative" ref={userRef}>
          <User
            className="w-6 h-6 cursor-pointer hover:text-gray-400"
            onClick={() => setUserModalOpen(!userModalOpen)}
          />

          <div
            className="relative cursor-pointer hover:text-gray-400"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="w-6 h-6" />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-1 text-xs">
                {totalQuantity}
              </span>
            )}
          </div>

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
      </div>

      <div className="hidden md:flex justify-center space-x-10 mt-[-20px] text-sm font-medium">
        <Link to="/" className="hover:text-gray-300">
          Accueil
        </Link>
        <Link to="/products" className="hover:text-gray-300">
          Nos produits
        </Link>
        <Link to="/appointment" className="hover:text-gray-300">
          Nos services
        </Link>
        <Link to="/contact" className="hover:text-gray-300">
          Contact
        </Link>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col space-y-2 text-sm font-medium">
          <Link to="/" className="hover:text-gray-300">
            Accueil
          </Link>
          <Link to="/products" className="hover:text-gray-300">
            Nos produits
          </Link>
          <Link to="/appointment" className="hover:text-gray-300">
            Nos services
          </Link>
          <Link to="/contact" className="hover:text-gray-300">
            Contact
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}

export default Appbar;
