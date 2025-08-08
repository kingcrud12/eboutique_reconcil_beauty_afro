import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const relayIcon = new L.Icon({
  iconUrl: '/mondial-relay-logo.png',
  iconSize: [32, 32],
});

interface User {
  id: number;
  adress: string;
}

interface ParcelShop {
  ID: string;
  Nom: string;
  Adresse1: string;
  Ville: string;
  CP: string;
  Latitude?: number;
  Longitude?: number;
  Available: boolean;
}

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: string;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

function Checkout() {
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState('');
  const [parcelShops, setParcelShops] = useState<ParcelShop[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<User>('/user/me')
      .then(res => {
        setUser(res.data);
        setAddress(res.data.adress);
        fetchCart();
      })
      .catch(err => console.error('Erreur récupération user :', err));
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get<Cart[]>('/cart/user');
      if (res.data.length > 0) {
        setCartItems(res.data[0].items);
      }
    } catch (err) {
      console.error('Erreur récupération panier :', err);
    }
  };

  const handleFindRelais = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isCustomAddress = address !== user.adress;
  
      const response = isCustomAddress
        ? await api.post<ParcelShop[]>('/point-relais', { address })
        : await api.post<ParcelShop[]>(`/point-relais/${user.id}`);
  
      setParcelShops(response.data);
    } catch (error) {
      console.error('Erreur récupération points relais :', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * parseFloat(item.product.price),
    0
  );

  return (
    <div className="checkout p-6 max-w-5xl mx-auto mt-[180px] space-y-10">
      <h1 className="text-xl font-bold mb-4">Adresse de livraison</h1>
      <form className="mb-6">
        <textarea
          className="w-full p-2 border border-gray-300 rounded"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </form>

      <button
        className="bg-gray-800 text-white px-4 py-2 rounded"
        onClick={handleFindRelais}
        disabled={loading || !user}
      >
        {loading ? 'Recherche...' : 'Trouver un point relais'}
      </button>

      {parcelShops.length > 0 && (
        <div className="bg-white border rounded-xl shadow p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img src="/mondial-relay-logo.png" alt="Mondial Relay" className="w-[50x] h-[60px]" />
            <h2 className="text-lg font-semibold">Sélectionnez votre point relais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 overflow-hidden sticky">
            {/* Carte Leaflet */}
            <MapContainer
              center={[parcelShops[0]?.Latitude || 48.8566, parcelShops[0]?.Longitude || 2.3522]}
              zoom={13}
              scrollWheelZoom={false}
              className="h-96 w-full rounded-xl overflow-hidden"
              style={{ maxWidth: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
              {parcelShops.map((shop) =>
                shop.Latitude && shop.Longitude ? (
                  <Marker
                    key={shop.ID}
                    position={[shop.Latitude, shop.Longitude]}
                    icon={relayIcon}
                  >
                    <Popup>
                      <p className="font-bold">{shop.Nom}</p>
                      <p>{shop.Adresse1}, {shop.CP} {shop.Ville}</p>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>

            {/* Liste des relais */}
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {parcelShops.map((shop) => (
                <li
                  key={shop.ID}
                  className={`p-4 border rounded-md ${
                    shop.Available
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <p className="font-semibold">{shop.Nom}</p>
                  <p className="text-sm">{shop.Adresse1}, {shop.CP} {shop.Ville}</p>
                  {!shop.Available && <p className="italic text-sm">Indisponible</p>}
                </li>
              ))}
            </ul>
          </div>

          <button className="bg-primary text-white px-4 py-2 rounded">
            Choisir ce point relais
          </button>
        </div>
      )}

      {/* 🛒 Panier */}
      {cartItems.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🛒 Votre panier</h2>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center bg-white p-4 rounded-2xl border shadow-sm space-x-4"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                </div>
                <p className="font-semibold text-primary">
                  {(item.quantity * parseFloat(item.product.price)).toFixed(2)} €
                </p>
              </li>
            ))}
          </ul>
          <div className="text-right mt-4 text-lg font-bold text-gray-800">
            Total : {totalPrice.toFixed(2)} €
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
