import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [authLoading, setAuthLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await login(); // redirige vers Auth0
    } catch (err) {
      console.error("Erreur login :", err);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="mt-[90px] flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Connexion
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition duration-200 font-semibold"
          >
            {authLoading ? "Connexion en cours..." : "Se connecter avec Auth0"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
