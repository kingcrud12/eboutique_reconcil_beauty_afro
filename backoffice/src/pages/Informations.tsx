import React from "react";

function Informations() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Informations générales</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Nom de la boutique</h2>
          <p className="text-gray-700">Réconcil' Afro Beauty</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Adresse</h2>
          <p className="text-gray-700">23 allée de la résidence du bois pommier, 91390 Morsang-sur-Orge</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Téléphone</h2>
          <p className="text-gray-700">+33 6 00 00 00 00</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="text-gray-700">contact@afrobeauty.com</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-gray-700 leading-relaxed">
            Réconcil’ Afro Beauty est une boutique spécialisée dans les produits cosmétiques naturels
            pour peaux et cheveux afro. Nous proposons également un service de coiffure sur rendez-vous.
            Notre mission : réconcilier chacun·e avec sa beauté naturelle et valoriser l’esthétique afro-descendante.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Informations;
