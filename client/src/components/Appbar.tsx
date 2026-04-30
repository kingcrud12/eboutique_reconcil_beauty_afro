import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, ShoppingCart, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

function Appbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, logout } = useAuth();
  const { totalQuantity, fetchCart, setCarts } = useCart();

  const isHome = location.pathname === "/";

  // Handle click outside user modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll for transparency effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  // Determine styles based on state
  // If Home and not scrolled: Transparent background, White text
  // If Scrolled or Not Home: White/Default background, Black text
  const isTransparent = isHome && !isScrolled;

  const navBgClass = isTransparent
    ? "bg-transparent shadow-none"
    : "bg-white/90 backdrop-blur-md text-black shadow-md";

  // Custom styles for text/icons
  const textColorClass = "text-black";
  const iconClass = "text-black hover:text-gray-700";

  // Custom hover styles for animated underline
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link to={to} className="relative group py-1">
      <span className={`text-black transition-colors duration-300 group-hover:text-purple-900`}>{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-purple-900 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );

  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBgClass}`}>


      {/* Main appbar */}
      <div className={`w-full px-4 py-2 sm:py-4 transition-colors duration-300 ${textColorClass}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className={`${iconClass} hover:scale-110 transition-transform`}>
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <Link to="/" className="flex flex-row items-center gap-3 sm:gap-4 group">
              <img src="/AM_LOGO.png" alt="Logo" className="h-16 sm:h-20 md:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              <p className={`text-[10px] sm:text-xs leading-none font-serif tracking-wider text-black hidden md:block group-hover:text-purple-900 transition-colors duration-300`}>
                Réconcil' Afro Beauty
              </p>
            </Link>
          </div>

          {/* Desktop Navigation with Animated Underline */}
          <div className={`hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest`}>
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/products">Nos produits</NavLink>
            <NavLink to="/prenez-un-rendez-vous-pour-une-coiffure-afro">Nos services</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          <div className="flex items-center gap-4 relative" ref={userRef}>
            <User
              className={`w-6 h-6 cursor-pointer ${iconClass}`}
              onClick={() => setUserModalOpen(!userModalOpen)}
            />

            <div
              className={`relative cursor-pointer ${iconClass}`}
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
              <div className="absolute right-0 top-full mt-2 w-48 bg-white text-black border rounded shadow-lg z-50 py-2">
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

        {menuOpen && (
          <div className="md:hidden mt-4 p-4 bg-white text-black rounded shadow-lg absolute left-0 right-0 z-40">
            <div className="flex flex-col space-y-4 text-sm font-medium">
              <Link to="/" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>
                Accueil
              </Link>
              <Link to="/products" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>
                Nos produits
              </Link>
              <Link to="/prenez-un-rendez-vous-pour-une-coiffure-afro" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>
                Nos services
              </Link>
              <Link to="/contact" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appbar;
