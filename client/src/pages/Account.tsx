import React, { useEffect, useState, useRef } from "react";
import api from "../connect_to_api/api";

interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  adress?: string;
  phone?: string;
}
interface IOrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: { id: number; name: string; imageUrl?: string };
  orderId: number;
}
interface IOrder {
  id: number;
  total: number;
  status: "pending" | "paid" | "canceled" | string;
  deliveryMode?: "RELAY" | "HOME" | "EXPRESS" | string;
  deliveryAddress: string;
  userId?: number;
  items: IOrderItem[];
}

function Account() {
  const [user, setUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState<IUser>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    adress: "",
  });

  const [showAccountCard, setShowAccountCard] = useState(true);
  const [showAddressCard, setShowAddressCard] = useState(false);
  const [showOrdersCard, setShowOrdersCard] = useState(false);

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // --- Toast (notification) pour l’aide d’adresse ---
  const [showAddressToast, setShowAddressToast] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const openAddressInfo = () => {
    setShowAddressToast(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => setShowAddressToast(false),
      5000
    );
  };
  const closeAddressInfo = () => {
    setShowAddressToast(false);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  };

  // ✅ Toast d’erreur moderne (ajout)
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const errorTimer = useRef<number | null>(null);
  const showError = (msg: string) => {
    setErrorToast(msg);
    if (errorTimer.current) window.clearTimeout(errorTimer.current);
    errorTimer.current = window.setTimeout(() => setErrorToast(null), 5000);
  };

  // ✅ Validation format d’adresse (ajout)
  const isValidAddressFormat = (addr?: string) => {
    if (!addr) return false;
    const v = addr.trim();
    // "12 rue Exemple, 75015, Paris" : numéro + libellé voie (pas de virgule), virgule, CP 5 chiffres, virgule, ville
    const re = /^\d+\s+[^,]+,\s*\d{5},\s*[^,]{2,}$/i;
    return re.test(v);
  };

  useEffect(() => {
    api
      .get<IUser>("/users/me")
      .then((res) => {
        setUser(res.data);
        setFormData(res.data);
      })
      .catch((err) => console.error("Erreur récupération user :", err));
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      if (errorTimer.current) window.clearTimeout(errorTimer.current); // ✅ clean (ajout)
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value } as IUser);

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ bloque si l'adresse du formulaire compte est au mauvais format
    const addr = formData.adress?.trim();
    if (addr && !isValidAddressFormat(addr)) {
      showError(
        "Adresse invalide. Utilisez le format : « 12 rue Exemple, 75001, Paris »."
      );
      return;
    }

    try {
      await api.patch("/users/me", formData);
      setUser(formData);
      setIsEditingAccount(false);
    } catch (err) {
      console.error("Erreur mise à jour du compte :", err);
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ bloque si l'adresse (section adresses) est au mauvais format
    if (!isValidAddressFormat(formData.adress)) {
      showError(
        "Adresse invalide. Exemple attendu : « 12 rue de l'ingénieur robert keller, 75015, Paris »."
      );
      return;
    }

    try {
      await api.patch("/users/me", { adress: formData.adress });
      setUser((prev) => (prev ? { ...prev, adress: formData.adress } : null));
      setIsEditingAddress(false);
    } catch (err) {
      console.error("Erreur mise à jour adresse :", err);
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
    setOrdersError(null);
    setLoadingOrders(true);
    try {
      const res = await api.get<IOrder[]>(`/orders/users/me`);
      setOrders(res.data || []);
    } catch (e) {
      console.error("Erreur récupération commandes :", e);
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
  const statusBadge = (s: string) =>
    s === "paid"
      ? badge("Payée", "bg-green-100 text-green-700")
      : s === "pending"
      ? badge("En attente", "bg-yellow-100 text-yellow-700")
      : s === "canceled"
      ? badge("Annulée", "bg-red-100 text-red-700")
      : badge(s, "bg-gray-100 text-gray-700");
  const deliveryBadge = (m?: string) =>
    m === "RELAY"
      ? badge("Point relais", "bg-blue-100 text-blue-700")
      : m === "HOME"
      ? badge("Domicile", "bg-purple-100 text-purple-700")
      : m === "EXPRESS"
      ? badge("Express", "bg-pink-100 text-pink-700")
      : null;

  return (
    <div className="relative p-6 max-w-6xl mx-auto mt-[160px] mb-[100px]">
      <h1 className="text-2xl font-bold text-center mb-[80px]">
        Bienvenue {user?.firstName} !
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card gauche (menu) */}
        <div className="bg-gray-100 p-6 rounded shadow h-[250px] flex flex-col">
          <div className="flex-shrink-0">
            <div className="text-lg font-semibold mb-2">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              🕒 {new Date().toLocaleTimeString()}
            </div>
          </div>

          <ul className="space-y-2 text-sm flex-1">
            <li>
              👤{" "}
              <button className="hover:underline" onClick={openAccount}>
                Mon compte
              </button>
            </li>
            <li className="flex items-center gap-2">
              📍
              <button className="hover:underline" onClick={openAddress}>
                Mes adresses de livraison
              </button>
              {/* ℹ️ icône info (gauche) */}
              <button
                type="button"
                onClick={openAddressInfo}
                className="ml-1 text-gray-500 hover:text-gray-800"
                aria-label="Aide sur le format d'adresse"
                title="Aide format d’adresse"
              >
                ℹ️
              </button>
            </li>
            <li>
              🛒{" "}
              <button className="hover:underline" onClick={openOrders}>
                Mes commandes
              </button>
            </li>
          </ul>

          <div className="h-0 flex-shrink-0" />
        </div>

        {/* Card droite : Compte */}
        {showAccountCard && (
          <div className="bg-gray-100 p-6 rounded shadow text-sm w-full h-[250px] overflow-hidden flex flex-col">
            <h2 className="text-lg font-medium mb-4 flex-shrink-0">
              Vos informations de compte :
            </h2>
            <div className="flex-1 overflow-y-auto pr-1">
              {!isEditingAccount ? (
                <>
                  <ul className="space-y-2 mb-4">
                    <li>
                      <strong>Nom :</strong> {user?.lastName}
                    </li>
                    <li>
                      <strong>Prénom :</strong> {user?.firstName}
                    </li>
                    <li>
                      <strong>Email :</strong> {user?.email}
                    </li>
                    <li>
                      <strong className="inline-flex items-center gap-2">
                        Adresse :{/* ℹ️ icône info (dans le récap compte) */}
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-800"
                          title="Exemple : 12 rue de l'ingénieur robert keller, 75015, Paris"
                          onClick={openAddressInfo}
                          aria-label="Aide sur le format d'adresse"
                        >
                          ℹ️
                        </button>
                      </strong>{" "}
                      {user?.adress || "Non renseignée"}
                    </li>
                    <li>
                      <strong className="inline-flex items-center gap-2">
                        Phone :{/* ℹ️ icône info (dans le récap compte) */}
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-800"
                          title="Exemple : 0744576854"
                          onClick={openAddressInfo}
                          aria-label="Aide sur le format d'adresse"
                        >
                          ℹ️
                        </button>
                      </strong>{" "}
                      {user?.phone || "Non renseignée"}
                    </li>
                  </ul>
                  <button
                    className="bg-black text-white px-4 py-2 rounded"
                    onClick={() => setIsEditingAccount(true)}
                  >
                    Modifier mes informations
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitAccount} className="space-y-4">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="email"
                    disabled
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-2 border cursor-not-allowed rounded"
                  />
                  <input
                    type="text"
                    name="adress"
                    value={formData.adress}
                    onChange={handleChange}
                    placeholder="Adresse"
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Adresse"
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAccount(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Card droite : Adresse */}
        {showAddressCard && (
          <div className="bg-gray-100 p-6 rounded shadow text-sm w-full h-[250px] overflow-hidden flex flex-col">
            <h2 className="text-lg font-medium mb-2 flex-shrink-0">
              Mon adresse de livraison :
            </h2>

            {/* Bandeau d'aide (dans la "modal"/section adresse) */}
            <div className="mb-2 bg-blue-50 text-blue-900 border border-blue-200 rounded px-3 py-2 text-xs flex items-start gap-2">
              <span className="mt-[1px]">ℹ️</span>
              <span>
                Format recommandé :{" "}
                <strong>N° de rue + rue, code postale, ville</strong>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {!isEditingAddress ? (
                <>
                  <p className="mt-[6px]">
                    <strong>Adresse :</strong>{" "}
                    {user?.adress || "Non renseignée"}
                  </p>
                  <button
                    className="bg-black text-white px-4 py-2 rounded mt-[60px]"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    Modifier l’adresse
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitAddress} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      name="adress"
                      value={formData.adress}
                      onChange={handleChange}
                      placeholder="Nouvelle adresse"
                      className="w-full p-2 border rounded"
                    />
                    <p className="mt-1 text-[11px] text-gray-500">
                      Exemple : 12 rue de l'ingénieur robert keller, 75015,
                      Paris
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Card droite : Commandes */}
        {showOrdersCard && (
          <div className="bg-white p-6 rounded shadow text-sm w-full h-[520px] overflow-hidden flex flex-col">
            <h2 className="text-lg font-medium mb-4 flex-shrink-0">
              Mes commandes
            </h2>
            <div className="flex-1 overflow-y-auto pr-1">
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
                        <li
                          key={it.id}
                          className="py-2 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {it.product?.imageUrl && (
                              <img
                                src={it.product.imageUrl}
                                alt={it.product.name}
                                className="w-10 h-10 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {it.product?.name ?? `Produit #${it.productId}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                Qté : {it.quantity}
                              </div>
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
          </div>
        )}
      </div>

      {/* Toast flottant (esthétique) */}
      {showAddressToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 max-w-sm bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-50"
        >
          <div className="flex items-start gap-3">
            <div className="text-blue-500 mt-[2px]">ℹ️</div>
            <div className="text-sm">
              <div className="font-medium mb-1">
                Format d’adresse recommandé
              </div>
              <div className="text-gray-600">
                12 rue de l'ingénieur robert keller, 75015, Paris
              </div>
            </div>
            <button
              onClick={closeAddressInfo}
              className="ml-auto text-gray-400 hover:text-gray-700"
              aria-label="Fermer la notification"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ✅ Toast d’erreur moderne (ajout) */}
      {errorToast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 max-w-sm bg-white border border-red-300 shadow-lg rounded-lg p-4 z-50"
        >
          <div className="flex items-start gap-3">
            <div className="text-red-600 mt-[2px]">⚠️</div>
            <div className="text-sm">
              <div className="font-medium mb-1 text-red-700">
                Adresse non valide
              </div>
              <div className="text-gray-700">{errorToast}</div>
            </div>
            <button
              onClick={() => setErrorToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-700"
              aria-label="Fermer l’alerte"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
