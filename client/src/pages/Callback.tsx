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
          setUser(postRes.data.user); // Met à jour l'utilisateur dans le contexte
          setIsAuthenticated(true); // Met à jour l'état d'authentification
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

  useEffect(() => {
    // Si l'authentification est réussie et le chargement est terminé, rediriger vers la page d'accueil
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
    // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de login
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  return <p>Connexion en cours…</p>; // Message visible pendant le processus
};

export default Callback;
