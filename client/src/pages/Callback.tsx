import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth(); // Assure-toi de les exposer depuis AuthContext

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        console.error("Pas de code reçu !");
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!codeVerifier) {
        console.error("Pas de code verifier en session !");
        return;
      }

      try {
        // Échange code PKCE contre token et cookie httpOnly côté backend
        await api.post(
          "/auth/callback",
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: window.location.origin + "/callback",
          },
          { withCredentials: true }
        );

        // Récupère le profil utilisateur après login
        const res = await api.get<{ id: number; email?: string }>("/users/me", {
          withCredentials: true,
        });

        // Met à jour le contexte Auth
        setUser(res.data);
        setIsAuthenticated(true);

        // Redirection finale vers la home
        navigate("/");
      } catch (err) {
        console.error("Erreur callback Auth0 :", err);
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  return <p>Connexion en cours...</p>;
};

export default Callback;
