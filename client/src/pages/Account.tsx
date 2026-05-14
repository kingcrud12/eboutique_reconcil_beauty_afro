import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { User as UserIcon, MapPin, Package, AlertCircle, Info } from "lucide-react";
import api from "../connect_to_api/api";

interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  adress?: string;
  phone?: string;
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

  const [activeTab, setActiveTab] = useState<"profile" | "address">("profile");

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [errorToast, setErrorToast] = useState<string | null>(null);
  const errorTimer = useRef<number | null>(null);

  const showError = (msg: string) => {
    setErrorToast(msg);
    if (errorTimer.current) window.clearTimeout(errorTimer.current);
    errorTimer.current = window.setTimeout(() => setErrorToast(null), 5000);
  };

  const isValidAddressFormat = (addr?: string) => {
    if (!addr) return false;
    const v = addr.trim();
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
      if (errorTimer.current) window.clearTimeout(errorTimer.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value } as IUser);

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-sage-50 py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">
            Mon Espace Personnel
          </h1>
          <p className="text-gray-500">
            Bienvenue {user?.firstName}, gérez vos informations et suivez vos commandes ici.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-sage-50/50 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center font-serif text-xl font-medium">
                {user?.firstName?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium text-gray-900 line-clamp-1">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{user?.email}</p>
              </div>
            </div>
            
            <nav className="p-3 space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === "profile" 
                    ? "bg-sage-100 text-sage-800" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <UserIcon className="w-5 h-5" />
                Informations Personnelles
              </button>
              
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === "address" 
                    ? "bg-sage-100 text-sage-800" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MapPin className="w-5 h-5" />
                Mes Adresses
              </button>

              <div className="my-2 border-t border-gray-100"></div>

              <Link
                to="/orders"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5" />
                Mes Commandes
              </Link>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-serif text-gray-900 mb-6">Vos Informations</h2>
                
                {!isEditingAccount ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Prénom</p>
                        <p className="font-medium text-gray-900">{user?.firstName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nom</p>
                        <p className="font-medium text-gray-900">{user?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                        <p className="font-medium text-gray-900">{user?.phone || "—"}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setIsEditingAccount(true)}
                        className="px-6 py-2.5 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors"
                      >
                        Modifier mes informations
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAccount} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Prénom</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Nom</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1.5">Email (non modifiable)</label>
                        <input
                          type="email"
                          disabled
                          name="email"
                          value={formData.email}
                          className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1.5">Téléphone</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleChange}
                          placeholder="Ex: 0612345678"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAccount(false);
                          setFormData(user!); // reset
                        }}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ADDRESS TAB */}
            {activeTab === "address" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif text-gray-900">Adresse de livraison</h2>
                </div>

                {!isEditingAddress ? (
                  <div className="space-y-6">
                    <div className="bg-sage-50 border border-sage-100 p-5 rounded-xl flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Adresse par défaut</p>
                        <p className="text-gray-600 leading-relaxed">
                          {user?.adress || "Vous n'avez pas encore renseigné d'adresse."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="px-6 py-2.5 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors"
                      >
                        Modifier mon adresse
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAddress} className="space-y-5">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                      <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
                      <p>
                        Format recommandé : <strong>N° de rue + libellé, code postal, ville</strong><br/>
                        <span className="opacity-80">Exemple : 12 rue de l'ingénieur robert keller, 75015, Paris</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Adresse complète</label>
                      <input
                        type="text"
                        name="adress"
                        value={formData.adress || ""}
                        onChange={handleChange}
                        placeholder="N° et rue, CP, Ville"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-colors"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 transition-colors"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAddress(false);
                          setFormData(user!); // reset
                        }}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Modern Error Toast */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-white border-l-4 border-red-500 shadow-xl rounded-lg p-4 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">Information invalide</p>
              <p className="text-sm text-gray-600">{errorToast}</p>
            </div>
            <button
              onClick={() => setErrorToast(null)}
              className="text-gray-400 hover:text-gray-600 ml-auto"
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
