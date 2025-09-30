import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, authLoading, isAuthenticated } =
    useAuth();

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
        // 1) Échange du code contre un token côté backend
        const postRes = await api.post(
          "/auth/callback",
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: window.location.origin + "/callback",
          },
          { withCredentials: true }
        );

        // Supprime le verifier après usage
        sessionStorage.removeItem("pkce_code_verifier");

        if (postRes.data?.user) {
          console.log("Utilisateur trouvé, mise à jour du contexte.");
          sessionStorage.setItem("auth_token", postRes.data.token); // Stocke le token dans sessionStorage
          setUser(postRes.data.user); // Met à jour l'utilisateur dans le contexte
          setIsAuthenticated(true); // Met à jour l'état d'authentification
          console.log("isAuthenticated après mise à jour: ", true);
          navigate("/", { replace: true }); // Redirige vers la page d'accueil
        } else {
          console.error("Utilisateur non trouvé après callback.");
          navigate("/login", { replace: true }); // Redirige vers login
        }
      } catch (err) {
        console.error("Erreur lors du callback Auth0 :", err);
        navigate("/login", { replace: true }); // Redirige vers la page de login en cas d'erreur
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  // Affiche le message de connexion en attendant que l'authentification soit terminée
  if (authLoading || !isAuthenticated) {
    console.log("authLoading: ", authLoading);
    console.log("isAuthenticated dans Callback: ", isAuthenticated);
    return <p>Connexion en cours…</p>;
  }

  return null;
};

export default Callback;
