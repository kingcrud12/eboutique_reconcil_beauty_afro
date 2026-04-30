import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-sage-700 text-white">
      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/AM_LOGO.png" alt="Logo" className="w-10 h-10 object-contain brightness-0 invert" />
              <span className="text-xl font-serif font-bold">Reconcil</span>
            </div>
            <p className="text-sage-200 text-sm leading-relaxed">
              Beauté naturelle afro, produits bio et artisanaux pour sublimer vos cheveux.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sage-200 text-sm hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/shop/products" className="text-sage-200 text-sm hover:text-white transition-colors">
                  Produits
                </Link>
              </li>
              <li>
                <Link to="/shop/about" className="text-sage-200 text-sm hover:text-white transition-colors">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/shop/contact" className="text-sage-200 text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Informations</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sage-200 text-sm cursor-pointer hover:text-white transition-colors">Livraison</span>
              </li>
              <li>
                <span className="text-sage-200 text-sm cursor-pointer hover:text-white transition-colors">Retours</span>
              </li>
              <li>
                <span className="text-sage-200 text-sm cursor-pointer hover:text-white transition-colors">CGV</span>
              </li>
              <li>
                <Link to="/shop/products" className="text-sage-200 text-sm hover:text-white transition-colors">Huile de Chébé pure</Link>
              </li>
              <li>
                <Link to="/shop/products" className="text-sage-200 text-sm hover:text-white transition-colors">Soins à l'Huile de Carthame</Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Suivez-nous</h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-sage-500 flex items-center justify-center text-sage-200 hover:bg-sage-600 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-sage-500 flex items-center justify-center text-sage-200 hover:bg-sage-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@reconcil-afro-beauty.com"
                className="w-10 h-10 rounded-full border border-sage-500 flex items-center justify-center text-sage-200 hover:bg-sage-600 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sage-300 text-xs">
              contact@reconcil-afro-beauty.com
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-sage-600">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 text-center">
          <p className="text-sage-300 text-xs">
            © 2026 Reconcil Afro Beauty. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
