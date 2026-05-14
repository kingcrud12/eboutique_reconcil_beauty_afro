import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/users", { firstName, lastName, email, password });
      if (response.status === 201 || response.status === 200) {
        navigate("/check");
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } catch (error: any) {
      console.error("Erreur d'inscription :", error);
      if (error.response?.status === 400) {
        setError("Cette adresse email est déjà utilisée.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white px-4 py-12">
      <div className="bg-white border border-gray-100 rounded-xl w-full max-w-md p-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold mb-2 text-center text-gray-800">
          Créer un compte
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Rejoignez la communauté Reconcil
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="lastName" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Nom</label>
            <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Prénom</label>
            <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Adresse email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Mot de passe</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-sage-600 text-white py-2.5 rounded-lg hover:bg-sage-700 transition-colors font-medium text-sm">
            S'inscrire
          </button>
        </form>

        <p className="text-sm text-center mt-8 text-gray-500">
          Déjà un compte ?{" "}
          <Link to="/Login" className="text-sage-600 font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
