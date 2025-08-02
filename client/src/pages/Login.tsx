import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;

      localStorage.setItem("token", token);
      login(token);
      navigate("/");
    } catch (error: any) {
      console.error("Erreur de connexion :", error.response?.data || error);
      setErrorMessage("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="mt-[90px] flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Connexion</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition duration-200 font-semibold"
          >
            Se connecter
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Pas encore de compte ?{" "}
          <Link to="/Register" className="text-slate-800 font-medium hover:underline">
            Créer un compte
          </Link>
        </p>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600 text-center font-medium">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
