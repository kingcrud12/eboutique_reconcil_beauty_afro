import React, { useEffect, useState, useCallback } from "react";
import api from "../connect_to_api/api";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name?: string;
  imageUrl?: string;
  price?: number | string;
  weight?: number | string; // EN GRAMMES (int ou string)
}
interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  product?: Product;
}
interface Order {
  id: number;
  total: number | string;
  shippingFee?: number | string;
  status: "pending" | "paid" | string;
  deliveryAddress: string;
  deliveryMode: "RELAY" | "HOME" | "LOCKER" | string;
  items: OrderItem[];
}
interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  adress?: string | null; // on garde "adress" comme dans ta DB
}

// ===== Helpers FRAIS DE LIVRAISON (mêmes barèmes que le back) =====
const SHIPPING_TABLES: Record<
  "RELAY" | "HOME" | "LOCKER",
  Array<[number, number]>
> = {
  RELAY: [
    [0.25, 4.20],
    [0.5, 4.49],
    [0.75, 5.69],
    [1.0, 5.69],
    [2.0, 6.99],
    [3.0, 7.69],
    [4.0, 9.29],
    [5.0, 12.99],
    [7.0, 14.99],
    [10.0, 15.99],
    [15.0, 23.49],
    [20.0, 23.99],
    [25.0, 34.99],
  ],
  HOME: [
    [0.25, 5.25],
    [0.5, 7.35],
    [0.75, 8.65],
    [1.0, 9.4],
    [2.0, 10.7],
    [5.0, 16.6],
  ],
  LOCKER: [
    [0.25, 3.99],
    [0.5, 3.99],
    [0.75, 4.49],
    [1.0, 4.49],
    [2.0, 6.19],
    [3.0, 6.99],
    [4.0, 8.49],
    [5.0, 11.99],
    [7.0, 14.89],
    [10.0, 15.89],
    [15.0, 23.39],
    [20.0, 23.89],
    [25.0, 34.89],
  ],
};

function computeItemsSubtotal(order: Order): number {
  return order.items.reduce((sum, it) => {
    const unit = Number(it.unitPrice);
    return sum + unit * it.quantity;
  }, 0);
}

const gramsToKg = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) / 1000 : 0;
};

function computeTotalWeightKg(order: Order): number {
  return order.items.reduce((sum, it) => {
    const weightKg = gramsToKg(it.product?.weight);
    return sum + weightKg * it.quantity;
  }, 0);
}

function computeShippingFee(order: Order): number {
  const provided = order.shippingFee;
  if (provided !== undefined && provided !== null && !isNaN(Number(provided))) {
    return Number(provided);
  }
  const modeKey = String(order.deliveryMode || "RELAY").toUpperCase() as
    | "RELAY"
    | "HOME"
    | "LOCKER";
  const table = SHIPPING_TABLES[modeKey] ?? SHIPPING_TABLES.RELAY;
  const weight = computeTotalWeightKg(order);
  for (const [maxKg, price] of table) {
    if (weight <= maxKg) return price;
  }
  return 0;
}

const translateStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "Payé";
    case "pending":
      return "En cours";
    default:
      return status;
  }
};

const translateDeliveryMode = (mode: string) => {
  switch (mode.toLowerCase()) {
    case "home":
      return "Livraison à domicile standard";
    case "relay":
      return "Livraison en point relais";
    case "locker":
      return "Livraison en locker";
    default:
      return mode;
  }
};

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  // modal produits
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // modal profile (smart)
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    adress?: string;
    phone?: string;
  }>({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [pendingPaymentAfterProfile, setPendingPaymentAfterProfile] = useState<
    number | null
  >(null);

  // BAN (Base Adresse Nationale) autocomplete state
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    const res = await api.get<Order[]>(`/orders/users/me`);
    setOrders(res.data ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // On récupère l'utilisateur complet
        try {
          console.log("Tentative de récupération de l'utilisateur...");
          const meRes = await api.get<User>("/users/me");
          console.log("Utilisateur récupéré avec succès:", meRes.data);
          setUser(meRes.data ?? null);
        } catch (userError) {
          console.error("Erreur récupération utilisateur :", userError);
          if (userError && typeof userError === "object" && "response" in userError) {
            const response = (userError as any).response;
            console.log("Détails de l'erreur:", {
              status: response?.status,
              statusText: response?.statusText,
              data: response?.data
            });
          } else {
            console.log("Détails de l'erreur (format inconnu):", userError);
          }
          // Si on ne peut pas récupérer l'utilisateur, on continue quand même
          // pour essayer de récupérer les commandes
          setUser(null);
        }

        await fetchOrders();
      } catch (e) {
        console.error("Erreur récupération commandes :", e);
        // Seulement rediriger vers login si on ne peut vraiment pas récupérer les commandes
        if (e && typeof e === 'object' && 'response' in e && e.response && typeof e.response === 'object' && 'status' in e.response && (e.response.status === 401 || e.response.status === 403)) {
          navigate("/shop/login");
        } else {
          setError("Erreur lors du chargement des commandes");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, fetchOrders]);

  // Keep query in sync when opening modal with existing user address
  useEffect(() => {
    if (profileModalOpen) {
      setAddressQuery(profileForm.adress ?? "");
    }
  }, [profileModalOpen, profileForm.adress]);

  // Debounced fetch to BAN API for address suggestions
  useEffect(() => {
    const q = addressQuery?.trim();
    if (!profileModalOpen) {
      setAddressSuggestions([]);
      return;
    }
    if (!q || q.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setAddressLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            q
          )}&limit=5`
        );
        const data = await res.json();
        const suggestions: string[] = Array.isArray(data?.features)
          ? data.features
              .map((f: any) => f?.properties?.label)
              .filter((s: any) => typeof s === "string")
          : [];
        setAddressSuggestions(suggestions);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setAddressLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [addressQuery, profileModalOpen]);

  const proceedToPayment = async (orderId: number) => {
    try {
      setPayingOrderId(orderId);
      await api.post("/payments/intent", { orderId, userId: user?.id ?? 1 });

      const checkoutRes = await api.post(`/payments/checkout/${orderId}`);
      const checkoutUrl =
        typeof checkoutRes.data === "string"
          ? checkoutRes.data
          : checkoutRes.data?.url;
      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        throw new Error("URL de paiement introuvable.");
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Erreur paiement :", err);
      alert(
        "Impossible d'initier le paiement pour le moment. Merci de réessayer."
      );
      setPayingOrderId(null);
    }
  };

  // handlePay : vérifie profile, ouvre modal si besoin, sinon proceed
  const handlePay = async (orderId: number, status: string) => {
    if (status !== "pending" || payingOrderId) return;

    // si user non chargé, on récupère (sécurité)
    if (!user) {
      try {
        const meRes = await api.get<User>("/users/me");
        setUser(meRes.data ?? null);
      } catch (e) {
        console.error("Impossible de récupérer le user :", e);
        navigate("/shop/login");
        return;
      }
    }

    // Vérifier les champs manquants
    const missingAdress = !user?.adress;
    const missingPhone = !user?.phone;

    if (missingAdress || missingPhone) {
      // ouvrir la modal "mettre à jour le profile" avec les champs manquants
      setProfileForm({
        adress: user?.adress ?? "",
        phone: user?.phone ?? "",
      });
      setPendingPaymentAfterProfile(orderId);
      setProfileModalOpen(true);
      return;
    }

    // tout bon -> procéder au paiement
    await proceedToPayment(orderId);
  };

  // soumission modal profile -> PATCH /users/me
  const handleSubmitProfile = async () => {
    // Valider au moins les champs affichés
    const showAdress =
      profileForm.adress !== undefined && profileForm.adress !== null;
    const showPhone =
      profileForm.phone !== undefined && profileForm.phone !== null;

    // build body only with fields that were shown (smart)
    const body: any = {};
    if (showAdress) body.adress = profileForm.adress?.trim();
    if (showPhone) body.phone = profileForm.phone?.trim();

    // simple validation : si champ visible et vide => erreur
    if ((showAdress && !body.adress) || (showPhone && !body.phone)) {
      alert("Merci de remplir les champs requis avant de valider.");
      return;
    }

    try {
      setProfileSubmitting(true);
      await api.patch("/users/me", body);
      // refresh user
      const meRes = await api.get<User>("/users/me");
      setUser(meRes.data ?? null);

      setProfileModalOpen(false);
      setProfileSubmitting(false);

      // si on avait un paiement en attente, on le relance
      if (pendingPaymentAfterProfile) {
        const orderIdToPay = pendingPaymentAfterProfile;
        setPendingPaymentAfterProfile(null);
        // small delay to let UI settle
        setTimeout(() => {
          proceedToPayment(orderIdToPay);
        }, 200);
      }
    } catch (e) {
      console.error("Erreur mise à jour profil :", e);
      alert("Impossible de mettre à jour votre profil pour le moment.");
      setProfileSubmitting(false);
    }
  };

  // ouvre modal produits
  const handleEdit = async (orderId: number, status: string) => {
    if (String(status).toLowerCase() === "paid") return;
    try {
      setError(null);
      const res = await api.get<Product[]>("/products");
      setProducts(res.data ?? []);
      setSelectedOrderId(orderId);
      setProductsModalOpen(true);
    } catch (e) {
      console.error("Erreur chargement produits", e);
      setError("Impossible de charger les produits.");
    }
  };

  const handleAddProductToOrder = async (productId: number) => {
    if (!selectedOrderId || !user?.id) return;
    try {
      setAddingProductId(productId);
      await api.patch(
        `/orders/users/me/${selectedOrderId}`,
        { items: [{ productId, quantity: 1 }] },
        { params: { userId: user.id } }
      );
      await fetchOrders();
      setProductsModalOpen(false);
      setSelectedOrderId(null);
    } catch (e) {
      console.error("Erreur ajout produit à la commande :", e);
      alert("Impossible d’ajouter l’article à la commande.");
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-sage-50 py-20 flex justify-center">
      <p className="text-gray-500 font-medium">Chargement de vos commandes...</p>
    </div>
  );

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-sage-50 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-3xl font-serif text-gray-900 mb-4">Mes commandes</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Vous n'avez pas encore passé de commande. Découvrez notre sélection de produits naturels pour vos cheveux.</p>
          <button
            onClick={() => navigate("/shop/products")}
            className="px-8 py-3 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Mes commandes</h1>
          <button onClick={() => navigate("/shop/account")} className="text-sm text-sage-600 hover:text-sage-800 font-medium transition-colors">
            &larr; Retour au profil
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

      {orders.map((order) => {
        const itemsSubtotal = computeItemsSubtotal(order);
        const shippingFee = computeShippingFee(order);
        const grandTotal = +(itemsSubtotal + shippingFee).toFixed(2);
        const isPending = String(order.status).toLowerCase() === "pending";
        const isPaid = String(order.status).toLowerCase() === "paid";
        const isPaying = payingOrderId === order.id;

        return (
          <div
            key={order.id}
            className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-serif text-lg text-gray-900 font-medium">Commande #{order.id}</span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isPending
                      ? "bg-amber-50 text-amber-700"
                      : isPaid
                      ? "bg-sage-100 text-sage-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {translateStatus(order.status)}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  {translateDeliveryMode(order.deliveryMode)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePay(order.id, order.status)}
                  disabled={!isPending || isPaying}
                  className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors
                    ${
                      isPending && !isPaying
                        ? "bg-sage-600 hover:bg-sage-700"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  title={
                    isPending
                      ? "Procéder au paiement"
                      : "Le paiement n’est possible que pour les commandes en attente"
                  }
                >
                  {isPaying ? "Redirection..." : "Payer la commande"}
                </button>

                <button
                  onClick={() => handleEdit(order.id, order.status)}
                  disabled={isPaid}
                  title={
                    isPaid
                      ? "Commande payée — modification désactivée"
                      : "Modifier la commande"
                  }
                  className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    isPaid
                      ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Modifier
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Adresse de Livraison</h3>
              <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Articles commandés</h3>
              <ul className="space-y-4">
                {order.items.map((it) => {
                  const p = it.product;
                  const unit = Number(it.unitPrice);
                  const lineTotal = (unit * it.quantity).toFixed(2);

                  return (
                    <li key={it.id} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-50">
                      {p?.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p?.name ?? `Produit #${it.productId}`}
                          className="w-16 h-16 object-contain rounded bg-white p-1 border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium">
                          N/A
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {p?.name ?? `Produit #${it.productId}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Quantité : {it.quantity} &times; {unit.toFixed(2)} €
                        </p>
                      </div>

                      <p className="font-semibold text-gray-900">{lineTotal} €</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Récap pricing */}
            <div className="mt-4 pt-4 border-t border-gray-50 text-sm space-y-2 flex flex-col items-end">
              <div className="flex justify-between w-full sm:w-64 text-gray-600">
                <span>Sous-total articles :</span>
                <span>{itemsSubtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 text-gray-600">
                <span>Frais de livraison :</span>
                <span>{shippingFee.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 font-serif text-lg font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total :</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>

              {Number(order.total) !== grandTotal && (
                <div className="text-xs text-amber-600 w-full sm:w-64 text-right mt-1">
                  (Total serveur : {Number(order.total).toFixed(2)} €)
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Modal Produits */}
      {productsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={() => {
                setProductsModalOpen(false);
                setSelectedOrderId(null);
              }}
            >
              ✕
            </button>
            <h3 className="text-2xl font-serif text-gray-900 mb-6">
              Ajouter un produit
            </h3>

            {products.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">Aucun produit disponible.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddProductToOrder(p.id)}
                    className="group border border-gray-100 bg-gray-50/50 rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-sage-200 transition-all text-center relative overflow-hidden"
                    title="Ajouter ce produit"
                  >
                    <div className="aspect-square bg-white rounded-lg mb-3 p-2 flex items-center justify-center border border-gray-100">
                      <img
                        src={p.imageUrl || ""}
                        alt={p.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight h-10 mb-1">{p.name}</p>
                    <p className="text-sm font-semibold text-sage-600">
                      {typeof p.price === "number"
                        ? p.price.toFixed(2)
                        : p.price}{" "}
                      €
                    </p>
                    
                    {addingProductId === p.id && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-semibold text-sage-600 bg-sage-50 px-3 py-1.5 rounded-full animate-pulse">Ajout...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Profile (smart) */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={() => {
                setProfileModalOpen(false);
                setPendingPaymentAfterProfile(null);
              }}
            >
              ✕
            </button>

            <h3 className="text-2xl font-serif text-gray-900 mb-2">
              Complétez vos informations
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Avant de valider votre paiement, veuillez vérifier et compléter ces informations nécessaires à la livraison.
            </p>

            <div className="space-y-4">
              {!user?.adress && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">
                    Adresse
                  </label>
                  <div className="relative">
                    <input
                      value={profileForm.adress ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileForm((s) => ({ ...s, adress: val }));
                        setAddressQuery(val);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors text-sm"
                      placeholder="N° et voie, code postal, ville"
                      disabled={profileSubmitting}
                    />
                    {addressLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    )}
                    {addressSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-auto text-sm">
                        {addressSuggestions.map((sug) => (
                          <li
                            key={sug}
                            className="px-4 py-2.5 hover:bg-sage-50 cursor-pointer border-b border-gray-50 last:border-0"
                            onClick={() => {
                              setProfileForm((s) => ({ ...s, adress: sug }));
                              setAddressQuery(sug);
                              setAddressSuggestions([]);
                            }}
                          >
                            {sug}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {!user?.phone && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-medium">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone ?? ""}
                    onChange={(e) =>
                      setProfileForm((s) => ({ ...s, phone: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors text-sm"
                    placeholder="Ex: 0612345678"
                    disabled={profileSubmitting}
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setPendingPaymentAfterProfile(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={profileSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitProfile}
                className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-700 transition-colors disabled:opacity-60"
                disabled={profileSubmitting}
              >
                {profileSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer et continuer"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Orders;
