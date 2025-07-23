import React, { useState, ChangeEvent } from "react";

function Settings() {
  const [shopName, setShopName] = useState("Réconcil' Afro Beauty");
  const [contactEmail, setContactEmail] = useState("contact@afrobeauty.com");
  const [phone, setPhone] = useState("+33 6 00 00 00 00");
  const [timezone, setTimezone] = useState("Europe/Paris");

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Envoyer les données au backend (ex. via fetch ou axios)
    console.log({
      shopName,
      contactEmail,
      phone,
      timezone,
      heroImage
    });
    alert("Paramètres enregistrés !");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Paramètres de la boutique</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Nom de la boutique */}
        <div>
          <label className="block font-medium mb-1">Nom de la boutique</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium mb-1">Email de contact</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        {/* Fuseau horaire */}
        <div>
          <label className="block font-medium mb-1">Fuseau horaire</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="Africa/Abidjan">Afrique/Abidjan</option>
            <option value="America/New_York">Amérique/New York</option>
            <option value="Asia/Tokyo">Asie/Tokyo</option>
          </select>
        </div>

        {/* Image Hero */}
        <div>
          <label className="block font-medium mb-6 ">Image de la bannière (Hero section)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Aperçu :</p>
              <img src={preview} alt="Hero preview" className="w-full h-48 object-cover rounded shadow" />
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
