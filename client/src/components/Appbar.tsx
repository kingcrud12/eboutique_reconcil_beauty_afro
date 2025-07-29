import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 

function Appbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserModalOpen(false);
  };

  const handleLoginRedirect = () => {
    setUserModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white text-black px-4 py-2 sm:py-4 shadow">
  <div className="flex items-center justify-between">
    {/* Burger menu */}
    <div className="md:hidden">
      <button onClick={() => setMenuOpen(!menuOpen)}>
        <Menu className="w-6 h-6" />
      </button>
    </div>

    {/* Logo */}
    <Link to="/" className="flex flex-col items-center">
      <img src="/AM_LOGO.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
      <p className="text-[10px] sm:text-xs leading-none">Réconcil' Afro Beauty</p>
    </Link>

    {/* Icônes */}
    <div className="flex items-center gap-4 relative" ref={userRef}>
      <User
        className="w-6 h-6 cursor-pointer hover:text-gray-400"
        onClick={() => setUserModalOpen(!userModalOpen)}
      />
      <ShoppingCart className="w-6 h-6 cursor-pointer hover:text-gray-400" />

      {/* Modal utilisateur */}
      {userModalOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white border rounded shadow-lg z-50 py-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/Account"
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

  {/* Navigation desktop */}
  <div className="hidden md:flex justify-center space-x-10 mt-2 text-sm font-medium">
    <Link to="/Products" className="hover:text-gray-300">Nos produits</Link>
    <Link to="/About" className="hover:text-gray-300">A propos de nous</Link>
    <Link to="/Appointment" className="hover:text-gray-300">Prenez rendez-vous</Link>
  </div>

  {/* Menu mobile */}
  {menuOpen && (
    <div className="md:hidden mt-2 flex flex-col space-y-2 text-sm font-medium">
      <Link to="/Products" className="hover:text-gray-300">Nos produits</Link>
      <Link to="/About" className="hover:text-gray-300">A propos de nous</Link>
      <Link to="/Appointment" className="hover:text-gray-300">Prenez rendez-vous</Link>
    </div>
  )}
</div>

  );
}

export default Appbar;
