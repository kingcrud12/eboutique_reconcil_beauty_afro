/* eslint-disable jsx-a11y/role-supports-aria-props */
import React, { useEffect, useState, useRef } from "react";
import api from "../connect_to_api/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { IProduct } from "../connect_to_api/product.interface";
import { useCart } from "../contexts/CartContext"; // ✅ AJOUT

const relayIcon = new L.Icon({
  iconUrl: "/mondial-relay-logo.png",
  iconSize: [84, 84],
  iconAnchor: [32, 64],
  popupAnchor: [0, -64],
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
  Nature?: string; // 👈 utile pour locker (ex: "C")
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

/** —— BAN API types (simplifiés) —— */
type BanFeatureProps = {
  housenumber?: string;
  street?: string;
  name?: string;
  postcode?: string;
  city?: string;
  label?: string;
};
type BanFeature = { properties: BanFeatureProps };
type BanResponse = { features: BanFeature[] };

function Checkout() {
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState("");
  const [parcelShops, setParcelShops] = useState<ParcelShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<ParcelShop | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCartId, setSelectedCartId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState<"home" | "relay" | null>(
    null
  );

  // --- Modal gestion
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  // --- Autocomplétion BAN
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [openSug, setOpenSug] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  const navigate = useNavigate();

  // ✅ récup des actions du contexte panier
  const { fetchCart: fetchCartContext, updateGuestCart } = useCart();

  useEffect(() => {
    api
      .get<User>("/users/me")
      .then(async (res) => {
        setUser(res.data);
        setAddress(res.data.adress);

        // 🔄 Réconciliation éventuelle d'un panier invité avec l'utilisateur connecté
        try {
          const guestUuid = localStorage.getItem("guest_cart_uuid");
          if (guestUuid) {
            await updateGuestCart({ userId: res.data.id });
            localStorage.removeItem("guest_cart_uuid");
          }
        } catch (e) {
          console.warn("Réconciliation guest cart échouée (non bloquant)", e);
        }

        await fetchCart();
        await fetchCartContext(); // ✅ synchro du contexte dès l’arrivée sur la page
      })
      .catch((err) => console.error("Erreur récupération user :", err));
  }, [fetchCartContext, updateGuestCart]);

  const fetchCart = async () => {
    try {
      const res = await api.get<Cart[]>("/carts/users/me");
      if (res.data.length > 0) {
        setCartItems(res.data[0].items);
        setSelectedCartId(res.data[0].id);
      } else {
        setCartItems([]);
        setSelectedCartId(null);
      }
    } catch (err) {
      console.error("Erreur récupération panier :", err);
    }
  };

  /** Formatte une suggestion BAN -> "numéro rue, code postale, ville" */
  const formatBan = (p: BanFeatureProps) => {
    const num = (p.housenumber ?? "").toString().trim();
    const voie = (p.street || p.name || "").toString().trim();
    const cp = (p.postcode ?? "").toString().trim();
    const ville = (p.city ?? "").toString().trim();
    const left = [num, voie].filter(Boolean).join(" ").trim();
    const right = [cp, ville].filter(Boolean).join(", ").trim(); // "75015, Paris"
    return left && right ? `${left}, ${right}` : (p.label ?? "").trim();
  };

  /** Lance la recherche BAN (débouncée + abortable) */
  const searchBan = (q: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 3) {
      setSuggestions([]);
      setOpenSug(false);
      setSearching(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setSearching(true);
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          q
        )}&limit=6&autocomplete=1`;
        const r = await fetch(url, { signal: ctrl.signal });
        const json: BanResponse = await r.json();
        const list = (json.features || [])
          .map((f) => formatBan(f.properties))
          .filter(Boolean);
        setSuggestions(list);
        setOpenSug(list.length > 0);
        setHighlight(-1);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          console.error("BAN erreur:", e);
        }
      } finally {
        setSearching(false);
      }
    }, 220); // léger debounce
  };

  const onAddressInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setAddress(v);
    searchBan(v);
  };

  const applySuggestion = (value: string) => {
    setAddress(value);
    setOpenSug(false);
    setHighlight(-1);
  };

  const onAddressKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!openSug || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpenSug(false);
      setHighlight(-1);
    }
  };

  const handleFindRelais = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isCustomAddress = address !== user.adress;
      const response = isCustomAddress
        ? await api.post<ParcelShop[]>("/point-relais", { address })
        : await api.post<ParcelShop[]>(`/point-relais/${user.id}`);
      setParcelShops(response.data);
    } catch (error) {
      console.error("Erreur récupération points relais :", error);
    } finally {
      setLoading(false);
    }
  };

  // Création commande pour domicile
  const createHomeOrder = async (mode: "home") => {
    if (!user) return;
    const cleanAddress = address?.trim();
    if (!cleanAddress) {
      alert("Veuillez saisir une adresse de livraison.");
      return;
    }
    setOrdering(mode);
    try {
      console.log("Tentative de création de commande (domicile)...", {
        deliveryAddress: cleanAddress,
        userId: user.id,
        deliveryMode: "HOME"
      });
      
      const response = await api.post("/orders", {
        deliveryAddress: cleanAddress,
        userId: user.id,
        deliveryMode: "HOME",
      });
      
      console.log("Commande créée avec succès:", response.data);
      navigate("/orders");
    } catch (e) {
      console.error("Erreur création commande (domicile) :", e);
      if (e && typeof e === "object" && "response" in e) {
        const response = (e as any).response;
        console.log("Détails de l'erreur API:", {
          status: response?.status,
          statusText: response?.statusText,
          data: response?.data
        });
        alert(`Erreur lors de la création de commande: ${response?.data?.message || response?.statusText || "Erreur inconnue"}`);
      } else {
        alert("Une erreur est survenue lors de la commande");
      }
    } finally {
      setOrdering(null);
    }
  };

  // 👇 utilitaire pour savoir si un point est un LOCKER
  const isLockerShop = (shop: ParcelShop | null) =>
    !!shop &&
    (String(shop.Nom).toUpperCase().includes("LOCKER") ||
      String(shop.Nature ?? "").toUpperCase() === "C");

  // Création commande via point relais sélectionné (RELAY/LOCKER)
  const handleCreateOrderRelay = async () => {
    if (!user || !selectedShop) return;
    const deliveryAddress = `${selectedShop.Adresse1}, ${selectedShop.CP}, ${selectedShop.Ville}`;
    const isLocker = isLockerShop(selectedShop);

    setOrdering("relay");
    try {
      console.log("Tentative de création de commande (relais/locker)...", {
        deliveryAddress,
        userId: user.id,
        deliveryMode: isLocker ? "LOCKER" : "RELAY"
      });
      
      const response = await api.post("/orders", {
        deliveryAddress,
        userId: user.id,
        deliveryMode: isLocker ? "LOCKER" : "RELAY", // 👈 envoie LOCKER si besoin
      });
      
      console.log("Commande créée avec succès:", response.data);
      navigate("/orders");
    } catch (error) {
      console.error("Erreur création commande (relais/locker) :", error);
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as any).response;
        console.log("Détails de l'erreur API:", {
          status: response?.status,
          statusText: response?.statusText,
          data: response?.data
        });
        alert(`Erreur lors de la création de commande: ${response?.data?.message || response?.statusText || "Erreur inconnue"}`);
      } else {
        alert("Une erreur est survenue lors de la commande");
      }
    } finally {
      setOrdering(null);
    }
  };

  // --- Ouverture modal & ajout produit
  const openModal = async () => {
    try {
      const res = await api.get<IProduct[]>("/products");
      setProducts(res.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Erreur chargement produits", error);
    }
  };

  const handleAddProduct = async (productId: number) => {
    if (!selectedCartId) return;
    try {
      setAddingProductId(productId);
      await api.patch(`/carts/users/me/${selectedCartId}`, {
        items: [{ productId, quantity: 1 }],
      });

      await fetchCartContext();
      await fetchCart();

      setModalOpen(false);
    } catch (error) {
      console.error("Erreur ajout produit", error);
      alert("Impossible d’ajouter l’article.");
    } finally {
      setAddingProductId(null);
    }
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * parseFloat(item.product.price),
    0
  );

  return (
    <div className="checkout p-6 max-w-5xl mx-auto mt-[180px] space-y-10">
      <h1 className="text-xl font-bold mb-4">Adresse de livraison</h1>

      {/* Champ adresse + suggestions BAN */}
      <form className="mb-4">
        <div className="relative">
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={3}
            value={address}
            onChange={onAddressInput}
            onKeyDown={onAddressKeyDown}
            onBlur={() => setTimeout(() => setOpenSug(false), 120)}
            placeholder="Ex. 12 rue de l'ingénieur robert keller, 75015, Paris"
            aria-autocomplete="list"
            aria-expanded={openSug}
            aria-controls="address-suggestions"
          />
          {openSug && (
            <ul
              id="address-suggestions"
              role="listbox"
              className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {searching && (
                <li className="px-3 py-2 text-sm text-gray-500">Recherche…</li>
              )}
              {suggestions.map((s, idx) => (
                <li
                  key={`${s}-${idx}`}
                  role="option"
                  aria-selected={idx === highlight}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applySuggestion(s)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                    idx === highlight ? "bg-gray-100" : ""
                  }`}
                  title={s}
                >
                  {s}
                </li>
              ))}
              {!searching && suggestions.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">
                  Aucune suggestion
                </li>
              )}
            </ul>
          )}
        </div>
      </form>

      {/* Boutons d’action */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          onClick={handleFindRelais}
          disabled={loading || !user}
        >
          {loading ? "Recherche..." : "Trouver un point relais ou un locker"}
        </button>

        <button
          className="px-4 py-2 rounded border hover:bg-gray-50 disabled:opacity-60"
          onClick={() => createHomeOrder("home")}
          disabled={!user || ordering !== null}
          title="Livraison standard à l'adresse saisie"
        >
          {ordering === "home" ? "Création..." : "Livraison à domicile (Colissimo)"}
        </button>

      </div>

      {parcelShops.length > 0 && (
        <div className="bg-white border rounded-xl shadow p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src="/mondial-relay-logo.png"
              alt="Mondial Relay"
              className="w-[120px] h-[60px]"
            />
            <h2 className="text-lg font-semibold">
              Sélectionnez votre point relais ou votre locker
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0 overflow-hidden">
            {/* Carte */}
            <MapContainer
              center={[
                parcelShops[0]?.Latitude || 48.8566,
                parcelShops[0]?.Longitude || 2.3522,
              ]}
              zoom={13}
              scrollWheelZoom={false}
              className="h-96 w-full rounded-xl overflow-hidden sticky"
              style={{ maxWidth: "100%" }}
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
                      <p className="font-bold">
                        {shop.Nom}
                        {isLockerShop(shop) && (
                          <span className="ml-2 inline-block text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 align-middle">
                            LOCKER
                          </span>
                        )}
                      </p>
                      <p>
                        {shop.Adresse1}, {shop.CP} {shop.Ville}
                      </p>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>

            {/* Liste */}
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {parcelShops.map((shop) => {
                const isSelected = selectedShop?.ID === shop.ID;
                const isDisabled = !shop.Available;

                return (
                  <li
                    key={shop.ID}
                    role="button"
                    onClick={() => !isDisabled && setSelectedShop(shop)}
                    className={`p-4 border rounded-md transition cursor-pointer
                      ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-300"
                          : ""
                      }
                      ${
                        isDisabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-900"
                      }
                    `}
                    title={
                      isDisabled
                        ? "Ce point relais est indisponible"
                        : "Cliquez pour sélectionner"
                    }
                  >
                    <p className="font-semibold">
                      {shop.Nom}
                      {isLockerShop(shop) && (
                        <span className="ml-2 inline-block text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 align-middle">
                          LOCKER
                        </span>
                      )}
                    </p>
                    <p className="text-sm">
                      {shop.Adresse1}, {shop.CP} {shop.Ville}
                    </p>
                    {isDisabled && (
                      <p className="italic text-sm">Indisponible</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedShop && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
              onClick={handleCreateOrderRelay}
              disabled={ordering !== null}
            >
              {ordering === "relay"
                ? "valider ce point relais et commander"
                : "Valider ce locker et commander"}
            </button>
          )}
        </div>
      )}

      {/* 🛒 Panier */}
      {cartItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              🛒 Votre panier
            </h2>
            <button
              onClick={openModal}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Modifier le panier
            </button>
          </div>

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
                  <p className="text-sm text-gray-500">
                    Quantité : {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {(item.quantity * parseFloat(item.product.price)).toFixed(2)}{" "}
                  €
                </p>
              </li>
            ))}
          </ul>
          <div className="text-right mt-4 text-lg font-bold text-gray-800">
            Total : {totalPrice.toFixed(2)} €
          </div>
        </div>
      )}

      {/* Modal Produits */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">
              Ajouter un produit au panier
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddProduct(p.id)}
                  className="border rounded p-2 cursor-pointer hover:shadow transition"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-24 mx-auto mb-2 object-contain"
                  />
                  <p className="text-center text-sm font-medium">{p.name}</p>
                  <p className="text-center text-xs text-gray-500">
                    {Number(p.price).toFixed(2)} €
                  </p>
                  {addingProductId === p.id && (
                    <p className="text-xs text-center text-blue-600 mt-1">
                      Ajout...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
