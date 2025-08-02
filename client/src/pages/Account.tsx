import React, { useEffect, useState } from 'react';
import api from '../api/api';

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  adress?: string;
}

function Account() {
  const [user, setUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState<IUser>({
    firstName: '',
    lastName: '',
    email: '',
    adress: '',
  });

  const [showAccountCard, setShowAccountCard] = useState(true);
  const [showAddressCard, setShowAddressCard] = useState(false);

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    api.get('/user/me')
      .then((res) => {
        setUser(res.data);
        setFormData(res.data);
      })
      .catch((err) => console.error('Erreur récupération user :', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/user/me', formData);
      setUser(formData);
      setIsEditingAccount(false);
    } catch (err) {
      console.error('Erreur mise à jour du compte :', err);
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/user/me', { adress: formData.adress });
      setUser((prev) => prev ? { ...prev, adress: formData.adress } : null);
      setIsEditingAddress(false);
    } catch (err) {
      console.error('Erreur mise à jour adresse :', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-[160px] mb-[100px]">
      <h1 className="text-2xl font-bold text-center mb-[80px]">Bienvenue {user?.firstName} !</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section gauche */}
        <div className="bg-gray-100 p-6 rounded shadow">
          <div className="text-lg font-semibold mb-2">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            🕒 {new Date().toLocaleTimeString()}
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              👤 <button onClick={() => {
                setShowAccountCard(true);
                setShowAddressCard(false);
              }}>Mon compte</button>
            </li>
            <li>
              📍 <button onClick={() => {
                setShowAddressCard(true);
                setShowAccountCard(false);
              }}>Mes adresses de livraison</button>
            </li>
            <li>🛒 Mes commandes</li>
          </ul>
        </div>

        {/* Section droite */}
        {showAccountCard && (
          <div className="bg-gray-100 p-6 rounded shadow text-sm w-full">
            {!isEditingAccount ? (
              <>
                <h2 className="text-lg font-medium mb-4">Vos informations de compte :</h2>
                <ul className="space-y-2 mb-4">
                  <li><strong>Nom :</strong> {user?.lastName}</li>
                  <li><strong>Prénom :</strong> {user?.firstName}</li>
                  <li><strong>Email :</strong> {user?.email}</li>
                  <li><strong>Adresse :</strong> {user?.adress || 'Non renseignée'}</li>
                </ul>
                <button
                  className="bg-black text-white px-4 py-2 rounded"
                  onClick={() => setIsEditingAccount(true)}
                >
                  Modifier mes informations
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-medium mb-4">Modifier mes informations :</h2>
                <form onSubmit={handleSubmitAccount} className="space-y-4">
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Nom" className="w-full p-2 border rounded" />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Prénom" className="w-full p-2 border rounded" />
                  <input type="email" disabled name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
                  <input type="text" name="adress" value={formData.adress} onChange={handleChange} placeholder="Adresse" className="w-full p-2 border rounded" />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Enregistrer</button>
                    <button type="button" onClick={() => setIsEditingAccount(false)} className="bg-gray-300 px-4 py-2 rounded">Annuler</button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {showAddressCard && (
          <div className="bg-gray-50 p-6 rounded shadow text-sm w-full">
            {!isEditingAddress ? (
              <>
                <h2 className="text-lg font-medium mb-4">Mon adresse de livraison :</h2>
                <p><strong>Adresse :</strong> {user?.adress || 'Non renseignée'}</p>
                <button
                  className="mt-4 bg-black text-white px-4 py-2 rounded "
                  onClick={() => setIsEditingAddress(true)}
                >
                  Modifier l’adresse
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-medium mb-4">Modifier mon adresse :</h2>
                <form onSubmit={handleSubmitAddress} className="space-y-4">
                  <input type="text" name="adress" value={formData.adress} onChange={handleChange} placeholder="Nouvelle adresse" className="w-full p-2 border rounded" />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Enregistrer</button>
                    <button type="button" onClick={() => setIsEditingAddress(false)} className="bg-gray-300 px-4 py-2 rounded">Annuler</button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;
