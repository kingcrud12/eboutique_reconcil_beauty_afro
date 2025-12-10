import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../connect_to_api/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Réinitialisation du mot de passe");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!token) {
      setError("Lien invalide ou expiré.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      await api.patch(`/users/reset-password?token=${token}`, { password });
      setMessage("Mot de passe mis à jour avec succès !");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError("Une erreur est survenue. Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-4">{message}</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!error && (
          <form onSubmit={handleReset} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition duration-200"
            >
              Réinitialiser le mot de passe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
