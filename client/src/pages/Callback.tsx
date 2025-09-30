import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated, setIsAuthenticated, authLoading } =
    useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Vérification si le code est présent dans l'URL
      console.log("Code d'authentification trouvé dans l'URL :", code);
      if (!code) {
        console.error("Aucun code d'authentification trouvé dans l'URL.");
        navigate("/login", { replace: true });
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      console.log("Code Verifier trouvé dans la session :", codeVerifier);
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

        // Affichage de la réponse du backend
        console.log("Réponse du serveur après appel /auth/callback :", postRes);

        // Supprime le verifier après usage
        sessionStorage.removeItem("pkce_code_verifier");

        if (postRes.status === 200 && postRes.data?.user) {
          console.log("Utilisateur trouvé, mise à jour du contexte.");
          setUser(postRes.data.user); // Met à jour l'utilisateur dans le contexte
          setIsAuthenticated(true); // Met à jour l'état d'authentification
          navigate("/", { replace: true }); // Redirige vers la page d'accueil après l'authentification
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
    // Vérifie si l'authentification a été chargée avec succès
    console.log(
      "authLoading :",
      authLoading,
      "isAuthenticated :",
      isAuthenticated
    );
    if (!authLoading && !isAuthenticated) {
      console.log("Utilisateur non authentifié, redirection vers login");
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  return <p>Connexion en cours…</p>; // Message visible pendant le processus
};

export default Callback;
