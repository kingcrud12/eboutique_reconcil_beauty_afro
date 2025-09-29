/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: '"Pacifico", serif' }}
            >
              Reconcil Beauty Afro
            </h3>
            <p className="text-gray-300 mb-4">
              Des produits naturels pour sublimer vos cheveux afro
            </p>
            <div className="flex space-x-4">
              <a className="text-gray-300 hover:text-white cursor-pointer">
                <i className="ri-facebook-fill text-xl w-6 h-6 flex items-center justify-center"></i>
              </a>
              <a className="text-gray-300 hover:text-white cursor-pointer">
                <i className="ri-instagram-line text-xl w-6 h-6 flex items-center justify-center"></i>
              </a>
              <a className="text-gray-300 hover:text-white cursor-pointer">
                <i className="ri-twitter-line text-xl w-6 h-6 flex items-center justify-center"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produits</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Shampooings</li>
              <li>Masques</li>
              <li>Huiles</li>
              <li>Soins</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Aide</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Contact</li>
              <li>FAQ</li>
              <li>Livraison</li>
              <li>Retours</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <i className="ri-phone-line w-5 h-5 flex items-center justify-center mr-2"></i>
                +33 1 23 45 67 89
              </p>
              <p className="flex items-center">
                <i className="ri-mail-line w-5 h-5 flex items-center justify-center mr-2"></i>
                contact@afrohair.fr
              </p>
              <p className="flex items-start">
                <i className="ri-map-pin-line w-5 h-5 flex items-center justify-center mr-2 mt-1"></i>
                123 Rue de la Beauté
                <br />
                75001 Paris, France
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 AfroHair. Tous droits réservés. |{" "}
            <a
              href="https://readdy.ai/?origin=logo"
              className="hover:text-white cursor-pointer ml-1"
            >
              Powered by YANN DIPITA
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
