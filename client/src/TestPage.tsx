/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from "react";

export default function TestPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
                <a
                  href="#"
                  className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer"
                >
                  Accueil
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer"
                >
                  Produits
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer"
                >
                  À propos
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-teal-600 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer"
                >
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

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              <a
                href="#"
                className="text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer"
              >
                Accueil
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer"
              >
                Produits
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer"
              >
                À propos
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-r from-amber-50 to-orange-50 min-h-screen flex items-center"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=Beautiful%20African%20woman%20with%20natural%20curly%20hair%20in%20a%20modern%20salon%20setting%2C%20warm%20lighting%2C%20minimalist%20background%20with%20soft%20golden%20tones%2C%20professional%20hair%20care%20products%20visible%2C%20elegant%20and%20sophisticated%20atmosphere%2C%20high-end%20beauty%20photography%20style&width=1920&height=1080&seq=hero1&orientation=landscape')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Révélez la beauté de vos cheveux afro
              </h1>
              <p className="text-xl mb-8 leading-relaxed opacity-90">
                Découvrez notre collection exclusive de produits capillaires
                naturels, spécialement conçus pour sublimer et nourrir vos
                cheveux texturés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer">
                  Découvrir nos produits
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 whitespace-nowrap cursor-pointer">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos produits phares
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une sélection de produits naturels et efficaces pour tous types de
              cheveux afro
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-product-shop
          >
            {[
              {
                name: "Shampooing Hydratant Naturel",
                price: "24,99€",
                image:
                  "Beautiful bottle of natural hair shampoo for afro hair, elegant packaging design, soft lighting, minimalist background with natural elements, premium beauty product photography, warm golden tones",
              },
              {
                name: "Masque Nourrissant Karité",
                price: "32,99€",
                image:
                  "Luxury hair mask jar with shea butter for textured hair, premium packaging, elegant presentation, soft lighting, minimalist background, high-end beauty product photography",
              },
              {
                name: "Huile Capillaire Bio",
                price: "19,99€",
                image:
                  "Premium organic hair oil bottle for afro hair care, elegant glass packaging, natural ingredients visible, soft lighting, minimalist background, luxury beauty product photography",
              },
            ].map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`https://readdy.ai/api/search-image?query=$%7Bproduct.image%7D&width=400&height=400&seq=product${index}&orientation=squarish`}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Formule naturelle pour cheveux texturés
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-teal-600">
                      {product.price}
                    </span>
                    <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 whitespace-nowrap cursor-pointer">
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Une expertise dédiée aux cheveux afro
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Depuis plus de 10 ans, nous développons des produits
                spécialement formulés pour répondre aux besoins uniques des
                cheveux texturés. Notre engagement : des ingrédients naturels et
                des formules efficaces.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <i className="ri-check-line text-teal-600 text-xl w-6 h-6 flex items-center justify-center mr-3"></i>
                  <span className="text-gray-700">
                    Ingrédients 100% naturels
                  </span>
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-teal-600 text-xl w-6 h-6 flex items-center justify-center mr-3"></i>
                  <span className="text-gray-700">
                    Formules sans sulfates ni parabènes
                  </span>
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-teal-600 text-xl w-6 h-6 flex items-center justify-center mr-3"></i>
                  <span className="text-gray-700">
                    Testés et approuvés par des experts
                  </span>
                </li>
              </ul>
              <button className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer">
                Notre histoire
              </button>
            </div>
            <div className="relative">
              <img
                src="https://readdy.ai/api/search-image?query=Professional%20African%20hair%20stylist%20working%20with%20natural%20hair%20products%20in%20a%20modern%20salon%2C%20beautiful%20lighting%2C%20professional%20atmosphere%2C%20hair%20care%20expertise%2C%20elegant%20and%20sophisticated%20setting&width=600&height=400&seq=about1&orientation=landscape"
                alt="Expertise cheveux afro"
                className="rounded-xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Restez informée de nos nouveautés
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Recevez nos conseils beauté et découvrez en avant-première nos
            nouveaux produits
          </p>
          <form
            className="max-w-md mx-auto flex gap-4"
            data-readdy-form
            id="newsletter-form"
          >
            <input
              type="email"
              name="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            <button
              type="submit"
              className="bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                AfroHair
              </h3>
              <p className="text-gray-300 mb-4">
                Des produits naturels pour sublimer vos cheveux afro
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white cursor-pointer"
                >
                  <i className="ri-facebook-fill text-xl w-6 h-6 flex items-center justify-center"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white cursor-pointer"
                >
                  <i className="ri-instagram-line text-xl w-6 h-6 flex items-center justify-center"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white cursor-pointer"
                >
                  <i className="ri-twitter-line text-xl w-6 h-6 flex items-center justify-center"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produits</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Shampooings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Masques
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Huiles
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Soins
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Aide</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Livraison
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Retours
                  </a>
                </li>
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
              © 2024 AfroHair. Tous droits réservés. |
              <a
                href="https://readdy.ai/?origin=logo"
                className="hover:text-white cursor-pointer ml-1"
              >
                Powered by Readdy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
