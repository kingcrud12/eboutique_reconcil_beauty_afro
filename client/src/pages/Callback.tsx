import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, isAuthenticated, authLoading } =
    useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        navigate("/login", { replace: true });
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!codeVerifier) {
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

        // Si le backend retourne l'utilisateur, on met à jour le contexte
        if (postRes.data?.user) {
          setUser(postRes.data.user); // Met à jour l'utilisateur dans le contexte
          setIsAuthenticated(true); // Met à jour l'état d'authentification
        } else {
          console.error("Utilisateur non trouvé après callback.");
          navigate("/login", { replace: true }); // Redirige vers login
        }
      } catch (err) {
        console.error("Erreur callback Auth0 :", err);
        navigate("/login", { replace: true }); // Redirige vers la page de login en cas d'erreur
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  return <p>Connexion en cours…</p>;
};

export default Callback;
