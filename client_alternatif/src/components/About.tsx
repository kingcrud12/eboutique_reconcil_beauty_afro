import React from "react";

export default function About() {
  return (
    <section className="py-20 bg-gradient-to-r from-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Une expertise dédiée aux cheveux afro
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Depuis plus de 10 ans, nous développons des produits spécialement
              formulés pour répondre aux besoins uniques des cheveux texturés.
              Notre engagement : des ingrédients naturels et des formules
              efficaces.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <i className="ri-check-line text-teal-600 text-xl w-6 h-6 flex items-center justify-center mr-3"></i>
                <span className="text-gray-700">Ingrédients 100% naturels</span>
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
              src="https://readdy.ai/api/search-image?query=Professional%20African%20hair%20stylist%20working%20with%20natural%20hair%20products&width=600&height=400"
              alt="Expertise cheveux afro"
              className="rounded-xl shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
