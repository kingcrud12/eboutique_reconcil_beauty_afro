import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, authLoading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        console.error("Aucun code d'authentification trouvé dans l'URL.");
        navigate("/login", { replace: true });
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!codeVerifier) {
        console.error("Aucun code_verifier trouvé dans la session.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 1️⃣ Envoie le code au backend via le proxy
        await api.post(
          "/auth/callback",
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: window.location.origin + "/callback",
          },
          { withCredentials: true } // ✅ Important pour envoyer/recevoir le cookie HttpOnly
        );

        sessionStorage.removeItem("pkce_code_verifier");

        // 2️⃣ Récupère l'utilisateur connecté depuis le backend
        const userRes = await api.get("/users/me", { withCredentials: true });

        if (userRes.data) {
          setUser(userRes.data);
          setIsAuthenticated(true);
          navigate("/", { replace: true });
        } else {
          console.error("Utilisateur non trouvé après callback");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Erreur lors du callback Auth0 :", err);
        navigate("/login", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  if (authLoading) {
    return <p>Connexion en cours…</p>;
  }

  return null;
};

export default Callback;
