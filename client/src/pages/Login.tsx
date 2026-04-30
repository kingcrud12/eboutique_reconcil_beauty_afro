import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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

      const guestCart = localStorage.getItem(GUEST_STORAGE_KEY);
      if (location.state?.fromCart) {
        navigate("/delivery");
      } else if (guestCart) {
        navigate("/cart");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erreur de connexion :", error.response?.data || error);
      setErrorMessage("Email ou mot de passe incorrect.");
      setShowResetLink(true);
    }
  };

  const handleSendResetLink = async () => {
    try {
      await api.post("/users/send-password-reset-link", { email });
      setResetSent(true);
      setShowResetLink(false);
    } catch (error: any) {
      console.error("Erreur d'envoi :", error.response?.data || error);
      setErrorMessage("Impossible d'envoyer l'e-mail. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white px-4 py-12">
      <div className="bg-white border border-gray-100 rounded-xl w-full max-w-md p-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold mb-2 text-center text-gray-800">
          Connexion
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Connectez-vous à votre espace Reconcil
        </p>

        <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Adresse email
            </label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              data-testid="login-email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password" type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)} required
                data-testid="login-password"
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                data-testid="toggle-password-visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit" data-testid="login-submit"
            className="w-full bg-sage-600 text-white py-2.5 rounded-lg hover:bg-sage-700 transition-colors font-medium text-sm"
          >
            Se connecter
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500 text-center" data-testid="login-error">
            {errorMessage}
          </p>
        )}

        {showResetLink && (
          <p className="mt-3 text-sm text-center">
            <button onClick={handleSendResetLink} className="text-sage-600 hover:underline" data-testid="login-reset-link">
              Mot de passe oublié ? Réinitialiser
            </button>
          </p>
        )}

        {resetSent && (
          <p className="mt-3 text-sm text-sage-600 text-center" data-testid="login-reset-sent">
            Un e-mail de réinitialisation a été envoyé si le compte existe.
          </p>
        )}

        <p className="text-sm text-center mt-8 text-gray-500">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-sage-600 font-medium hover:underline" data-testid="login-register-link">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
