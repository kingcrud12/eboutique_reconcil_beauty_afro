import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../connect_to_api/api";
import { Lock } from "lucide-react";

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
    setError(""); setLoading(true);

    if (!token) { setError("Lien invalide ou expiré."); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); setLoading(false); return; }

    try {
      await api.patch(`/users/reset-password?token=${token}`, { password });
      setMessage("Mot de passe mis à jour avec succès !");
      setTimeout(() => navigate("/shop/login"), 3000);
    } catch (err: any) {
      setError("Une erreur est survenue. Lien invalide ou expiré.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white px-4 py-12">
      <div className="bg-white border border-gray-100 rounded-xl w-full max-w-md p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-sage-50 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-sage-600" />
        </div>
        <h1 className="text-xl font-serif font-bold text-gray-800 mb-6 text-center">{message}</h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {!error && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-sage-600 text-white py-2.5 rounded-lg hover:bg-sage-700 transition-colors font-medium text-sm disabled:opacity-50">
              Réinitialiser le mot de passe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
