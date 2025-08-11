import React, { useEffect, useState } from 'react';
import api from '../api/api';

interface IUser {
  id: number;          
  firstName: string;
  lastName: string;
  email: string;
  adress?: string;
}

interface IOrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  orderId: number;
}

interface IOrder {
  id: number;
  total: number;
  status: 'pending' | 'paid' | 'canceled' | string;
  deliveryMode?: 'RELAY' | 'HOME' | 'EXPRESS' | string;
  deliveryAddress: string;
  userId?: number;
  items: IOrderItem[];
}

function Account() {
  const [user, setUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState<IUser>({
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    adress: '',
  });

  const [showAccountCard, setShowAccountCard] = useState(true);
  const [showAddressCard, setShowAddressCard] = useState(false);
  const [showOrdersCard, setShowOrdersCard] = useState(false);

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    api.get<IUser>('/user/me')
      .then((res) => {
        setUser(res.data);
        setFormData(res.data);
      })
      .catch((err) => console.error('Erreur récupération user :', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value } as IUser);
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
      setUser((prev) => (prev ? { ...prev, adress: formData.adress } : null));
      setIsEditingAddress(false);
    } catch (err) {
      console.error('Erreur mise à jour adresse :', err);
    }
  };

  const openAccount = () => {
    setShowAccountCard(true);
    setShowAddressCard(false);
    setShowOrdersCard(false);
  };
  const openAddress = () => {
    setShowAccountCard(false);
    setShowAddressCard(true);
    setShowOrdersCard(false);
  };
  const openOrders = async () => {
    if (!user?.id) return;
    setShowAccountCard(false);
    setShowAddressCard(false);
    setShowOrdersCard(true);

    // charge les commandes au clic
    setOrdersError(null);
    setLoadingOrders(true);
    try {
      const res = await api.get<IOrder[]>(`/order/${user.id}`);
      setOrders(res.data || []);
    } catch (e) {
      console.error('Erreur récupération commandes :', e);
      setOrdersError("Impossible de récupérer vos commandes.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const badge = (text: string, color: string) => (
    <span className={`inline-block text-xs px-2 py-1 rounded-full ${color}`}>
      {text}
    </span>
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return badge('Payée', 'bg-green-100 text-green-700');
      case 'pending':
        return badge('En attente', 'bg-yellow-100 text-yellow-700');
      case 'canceled':
        return badge('Annulée', 'bg-red-100 text-red-700');
      default:
        return badge(status, 'bg-gray-100 text-gray-700');
    }
  };

  const deliveryBadge = (mode?: string) => {
    switch (mode) {
      case 'RELAY':
        return badge('Point relais', 'bg-blue-100 text-blue-700');
      case 'HOME':
        return badge('Domicile', 'bg-purple-100 text-purple-700');
      case 'EXPRESS':
        return badge('Express', 'bg-pink-100 text-pink-700');
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-[160px] mb-[100px]">
      <h1 className="text-2xl font-bold text-center mb-[80px]">
        Bienvenue {user?.firstName} !
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section gauche (menu) */}
        <div className="bg-gray-100 p-6 rounded shadow">
          <div className="text-lg font-semibold mb-2">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-sm text-gray-600 mb-4">🕒 {new Date().toLocaleTimeString()}</div>
          <ul className="space-y-2 text-sm">
            <li>
              👤{' '}
              <button className="hover:underline" onClick={openAccount}>
                Mon compte
              </button>
            </li>
            <li>
              📍{' '}
              <button className="hover:underline" onClick={openAddress}>
                Mes adresses de livraison
              </button>
            </li>
            <li>
              🛒{' '}
              <button className="hover:underline" onClick={openOrders}>
                Mes commandes
              </button>
            </li>
          </ul>
        </div>

        {/* Section droite : Compte */}
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
                  <input type="email" disabled name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border cursor-not-allowed rounded" />
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

        {/* Section droite : Adresse */}
        {showAddressCard && (
          <div className="bg-gray-50 p-6 rounded shadow text-sm w-full">
            {!isEditingAddress ? (
              <>
                <h2 className="text-lg font-medium mb-4">Mon adresse de livraison :</h2>
                <p><strong>Adresse :</strong> {user?.adress || 'Non renseignée'}</p>
                <button
                  className="mt-4 bg-black text-white px-4 py-2 rounded"
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

        {/* Section droite : Commandes */}
        {showOrdersCard && (
          <div className="bg-white p-6 rounded shadow text-sm w-full">
            <h2 className="text-lg font-medium mb-4">Mes commandes</h2>

            {loadingOrders && <p>Chargement des commandes…</p>}
            {ordersError && <p className="text-red-600">{ordersError}</p>}

            {!loadingOrders && !ordersError && orders.length === 0 && (
              <p>Aucune commande trouvée.</p>
            )}

            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">Commande #{o.id}</div>
                    <div className="flex items-center gap-2">
                      {statusBadge(o.status)}
                      {deliveryBadge(o.deliveryMode)}
                    </div>
                  </div>

                  <p className="text-gray-600 mt-1">
                    Adresse : {o.deliveryAddress}
                  </p>

                  <ul className="mt-3 divide-y">
                    {o.items.map((it) => (
                      <li key={it.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {it.product?.imageUrl && (
                            <img
                              src={it.product.imageUrl}
                              alt={it.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{it.product?.name ?? `Produit #${it.productId}`}</div>
                            <div className="text-xs text-gray-500">Qté : {it.quantity}</div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          {(it.unitPrice * it.quantity).toFixed(2)} €
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 text-right font-bold">
                    Total : {Number(o.total).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;
