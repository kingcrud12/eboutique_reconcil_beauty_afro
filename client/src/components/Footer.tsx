import React from "react";

function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white px-4 sm:px-8 md:px-20 pt-12 pb-6 overflow-hidden">
      {/* Top section */}
      <div className="flex flex-col md:flex-row justify-between border-b border-gray-600 pb-10 gap-10">
        {/* Logo & Description */}
        <div className="md:max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <img src="/AM_LOGO.png" alt="Logo" className="w-[100px] h-[90px]" />
            <span className="text-2xl font-bold mt-[-10px]">
              Réconcil' Afro Beauty
            </span>
          </div>
          <p className="text-gray-300">Texte à trouver pour cet espace</p>
        </div>

        {/* Liens groupés en responsive */}
        <div className="flex flex-wrap gap-12 text-gray-300">
          <div className="min-w-[130px]">
            <h4 className="text-green-500 font-semibold mb-4">Nos produits</h4>
            <ul className="space-y-2">
              <li>Nouveau produit</li>
              <li>Nos produits populaires</li>
              <li>Nos best sellers</li>
            </ul>
          </div>
          <div className="min-w-[130px]">
            <h4 className="text-green-500 font-semibold mb-4">
              A propos de nous
            </h4>
            <ul className="space-y-2">
              <li>Aide</li>
              <li>Livraisons</li>
              <li>Affiliation</li>
            </ul>
          </div>
          <div className="min-w-[130px]">
            <h4 className="text-green-500 font-semibold mb-4">Info</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/contact"
                  className="hover:text-green-500 transition-colors"
                >
                  Contactez nous
                </a>
              </li>
              <li>Politique de confidentialité</li>
              <li>Termes & Conditions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>© Yann Dipita All Rights Reserved.</p>
        <p>
          Designed with <span className="text-red-500">❤️</span> by{" "}
          <span className="text-white">Yann Dipita</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
