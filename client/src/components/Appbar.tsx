import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, ShoppingCart, Menu, X, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";
import { createProductSlug, createSlug } from "../utils/urlUtils";

function Appbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const { totalQuantity, fetchCart, setCarts } = useCart();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserModalOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
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

  // Search logic hooks
  useEffect(() => {
    api.get<IProduct[]>("/products").then(res => setProducts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  const handleLogout = () => {
    setCarts([]);
    window.dispatchEvent(new Event("cart:clear"));
    logout();
    setUserModalOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/products/soins-cheveux", label: "Soins Cheveux" },
    // { to: "/products/soins-corps", label: "Soins Corps" },
    { to: "/services", label: "Nos Services" },
    // { to: "/products/ingredients", label: "Nos Ingrédients" },
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
          <div className="hidden md:flex flex-1 max-w-xl mx-auto relative" ref={searchRef}>
            <div className="flex items-center w-full border border-gray-300 rounded-md px-3 py-2 bg-white hover:border-gray-400 transition-colors focus-within:border-sage-500">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Rechercher un produit, un ingrédient..."
                className="flex-1 ml-2.5 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate("/products");
                    setIsSearchFocused(false);
                  }
                }}
              />
            </div>

            {/* Dropdown de recherche */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-[999] overflow-hidden">
                {searchResults.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${createSlug(product.category)}/${createProductSlug(product.id, product.name)}`}
                    onClick={() => {
                      setIsSearchFocused(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-sage-50 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-contain mix-blend-multiply rounded-md bg-gray-50 p-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right — Mon compte + Panier */}
          <div className="hidden md:flex items-center gap-5 flex-shrink-0 relative" ref={userRef}>
            {/* Mon compte */}
            <div className="relative group" ref={userRef}>
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors py-2"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Mon compte</span>
              </Link>

              {/* User dropdown on hover */}
              <div className="absolute right-0 top-full w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Profil
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Mes commandes
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Panier */}
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">Panier ({totalQuantity})</span>
            </button>
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
            {/*
            <li>
              <Link
                to="/products/promotions"
                className="text-[14px] text-sage-600 font-medium hover:text-sage-700 transition-colors"
              >
                Promotions
              </Link>
            </li>
            */}
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
                <span className="font-bold text-gray-900">RECONCIL AFRO BEAUTY</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-4 border-b border-gray-100 relative" ref={mobileSearchRef}>
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Rechercher..."
                  className="flex-1 ml-2 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate("/products");
                      setIsSearchFocused(false);
                      setMenuOpen(false);
                    }
                  }}
                />
              </div>

              {/* Dropdown de recherche (mobile) */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-[999] overflow-hidden">
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${createSlug(product.category)}/${createProductSlug(product.id, product.name)}`}
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery("");
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-sage-50 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-contain mix-blend-multiply rounded-md bg-gray-50 p-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
                {/*
                <li>
                  <Link
                    to="/products/promotions"
                    className="block py-3 px-3 rounded text-sm text-sage-600 font-medium hover:bg-sage-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Promotions
                  </Link>
                </li>
                */}
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
