import { Link, useNavigate } from "react-router-dom";
import api from "../connect_to_api/api";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const GUEST_STORAGE_KEY = "guest_cart_uuid";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showResetLink, setShowResetLink] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁 toggle
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setShowResetLink(false);
    setResetSent(false);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;

      localStorage.setItem("token", token);
      login(token);

      // 🔹 redirection selon présence d'un panier guest
      const guestCart = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestCart) {
        navigate("/cart");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erreur de connexion :", error.response?.data || error);
      setErrorMessage("Email ou mot de passe incorrect.");
      if (error.response?.status === 401) {
        setShowResetLink(true);
      }
    }
  };

  const handleSendResetLink = async () => {
    try {
      await api.post("/users/send-password-reset-link", { email });
      setResetSent(true);
      setShowResetLink(false);
    } catch (error: any) {
      console.error(
        "Erreur d'envoi de l'e-mail de réinitialisation :",
        error.response?.data || error
      );
      setErrorMessage("Impossible d’envoyer l’e-mail. Veuillez réessayer.");
    }
  };

  return (
    <div className="mt-[90px] flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Connexion
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse email
            </label>
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 pr-10 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              {/* 👁 bouton œil */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition duration-200 font-semibold"
          >
            Se connecter
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600 text-center font-medium">
            {errorMessage}
          </p>
        )}

        {showResetLink && (
          <p className="mt-4 text-sm text-center">
            <button
              onClick={handleSendResetLink}
              className="text-blue-600 hover:underline"
            >
              Mot de passe oublié ? Cliquez ici pour recevoir un lien de
              réinitialisation.
            </button>
          </p>
        )}

        {resetSent && (
          <p className="mt-4 text-sm text-green-600 text-center font-medium">
            Un e-mail de réinitialisation a été envoyé si le compte existe.
          </p>
        )}

        <p className="text-sm text-center mt-6 text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-slate-800 font-medium hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
