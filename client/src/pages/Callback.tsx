import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

      // Récupération de l'URL de redirection initiale (si présente)
      const redirectUrl = params.get("state") || "/"; // Par défaut, rediriger vers la page d'accueil

      if (!code || !codeVerifier) {
        console.error("Code ou code_verifier manquant");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 1️⃣ Appel backend pour récupérer le token et user
        const res = await api.post("/auth/callback", {
          code,
          code_verifier: codeVerifier,
          redirect_uri: window.location.origin + "/callback",
        });

        sessionStorage.removeItem("pkce_code_verifier");

        const { token, user } = res.data;

        if (token && user) {
          // 2️⃣ Stockage du JWT côté client
          localStorage.setItem("auth_token", token);

          // 3️⃣ Mise à jour du contexte
          setUser(user);
          setIsAuthenticated(true);

          // Rediriger l'utilisateur vers la page d'origine ou vers la page d'accueil si aucun état (URL) n'est défini
          navigate(redirectUrl, { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Erreur lors du callback :", err);
        navigate("/login", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  return null;
};

export default Callback;
