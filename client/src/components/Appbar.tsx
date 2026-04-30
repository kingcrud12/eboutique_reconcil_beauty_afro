import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, ShoppingCart, Menu, X, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

function Appbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setCarts([]);
    window.dispatchEvent(new Event("cart:clear"));
    logout();
    setUserModalOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/products", label: "Soins Cheveux" },
    { to: "/products", label: "Soins Corps" },
    { to: "/prenez-un-rendez-vous-pour-une-coiffure-afro", label: "Nos Services" },
    { to: "/products", label: "Nos Ingrédients" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* ═══ ROW 1 : Logo | Search | Mon compte + Panier ═══ */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-6">

          {/* Left — Logo + Brand name */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="/AM_LOGO.png"
              alt="Réconcil' Afro Beauty"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="hidden sm:block leading-tight">
              <span className="block text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                RECONCIL
              </span>
              <span className="block text-[11px] text-sage-600 font-medium -mt-0.5">
                Afro Beauty Naturelle
              </span>
            </div>
          </Link>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 ml-auto"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Center — Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="flex items-center w-full border border-gray-300 rounded-md px-3 py-2 bg-white hover:border-gray-400 transition-colors focus-within:border-sage-500">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Rechercher un produit, un ingrédient..."
                className="flex-1 ml-2.5 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate("/products");
                }}
              />
            </div>
          </div>

          {/* Right — Mon compte + Panier */}
          <div className="hidden md:flex items-center gap-5 flex-shrink-0 relative" ref={userRef}>
            {/* Mon compte */}
            <button
              onClick={() => setUserModalOpen(!userModalOpen)}
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Mon compte</span>
            </button>

            {/* Panier */}
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">Panier ({totalQuantity})</span>
            </button>

            {/* User dropdown */}
            {userModalOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => setUserModalOpen(false)}
                    >
                      Mon compte
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => setUserModalOpen(false)}
                    >
                      Mes commandes
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-red-500"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => { setUserModalOpen(false); navigate("/login"); }}
                    >
                      Se connecter
                    </button>
                    <Link
                      to="/register"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => setUserModalOpen(false)}
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile icons (compact) */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setUserModalOpen(!userModalOpen)}
              className="text-gray-600"
              aria-label="Mon compte"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="relative text-gray-600"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sage-600 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ ROW 2 : Navigation links (desktop) ═══ */}
      <nav className="hidden md:block w-full bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 lg:gap-10 py-2.5">
            {navLinks.map((link, i) => (
              <li key={i}>
                <Link
                  to={link.to}
                  className={`text-[14px] transition-colors whitespace-nowrap ${location.pathname === link.to
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/products"
                className="text-[14px] text-sage-600 font-medium hover:text-sage-700 transition-colors"
              >
                Promotions
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ═══ Mobile drawer ═══ */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/AM_LOGO.png" alt="Logo" className="h-8 w-auto" />
                <span className="font-bold text-gray-900">RECONCIL</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="flex-1 ml-2 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { navigate("/products"); setMenuOpen(false); }
                  }}
                />
              </div>
            </div>

            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className={`block py-3 px-3 rounded text-sm transition-colors ${location.pathname === "/" ? "bg-sage-50 text-sage-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Accueil
                  </Link>
                </li>
                {navLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.to}
                      className={`block py-3 px-3 rounded text-sm transition-colors ${location.pathname === link.to ? "bg-sage-50 text-sage-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/products"
                    className="block py-3 px-3 rounded text-sm text-sage-600 font-medium hover:bg-sage-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Promotions
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile user menu */}
            <div className="border-t border-gray-100 p-4 mt-auto">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link to="/account" className="block text-sm text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                    Mon compte
                  </Link>
                  <Link to="/orders" className="block text-sm text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
                    Mes commandes
                  </Link>
                  <button className="block text-sm text-red-500 py-2" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  className="w-full py-2.5 bg-sage-600 text-white rounded-lg text-sm font-medium"
                  onClick={() => { setMenuOpen(false); navigate("/login"); }}
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile user dropdown (outside drawer) */}
      {userModalOpen && !menuOpen && (
        <div className="md:hidden fixed top-14 right-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1" ref={userRef}>
          {isAuthenticated ? (
            <>
              <Link to="/account" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700" onClick={() => setUserModalOpen(false)}>
                Mon compte
              </Link>
              <Link to="/orders" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700" onClick={() => setUserModalOpen(false)}>
                Mes commandes
              </Link>
              <hr className="my-1 border-gray-100" />
              <button className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-red-500" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700" onClick={() => { setUserModalOpen(false); navigate("/login"); }}>
                Se connecter
              </button>
              <Link to="/register" className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700" onClick={() => setUserModalOpen(false)}>
                Créer un compte
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Appbar;
