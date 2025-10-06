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

      // Récupérer l'URL de redirection initiale (si présente)
      const redirectUrl = params.get("state") || "/"; // Par défaut, rediriger vers la page d'accueil

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
        // 1️⃣ Envoie le code au backend via le proxy pour obtenir le token
        const res = await api.post("/auth/callback", {
          code,
          code_verifier: codeVerifier,
          redirect_uri: window.location.origin + "/callback",
        });

        sessionStorage.removeItem("pkce_code_verifier");

        const { token } = res.data;

        if (token) {
          // 2️⃣ Stockage du JWT côté client
          localStorage.setItem("auth_token", token);

          // 3️⃣ Récupérer l'utilisateur connecté via /users/me
          const userRes = await api.get("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`, // Envoi du token dans l'entête Authorization
            },
          });

          const user = userRes.data;

          if (user) {
            // 4️⃣ Mise à jour du contexte avec l'utilisateur et le statut d'authentification
            setUser(user);
            setIsAuthenticated(true);

            // Rediriger l'utilisateur vers la page d'origine ou vers la page d'accueil si aucun état (URL) n'est défini
            navigate(redirectUrl, { replace: true });
          } else {
            console.error("Utilisateur non trouvé après callback");
            navigate("/login", { replace: true });
          }
        } else {
          console.error("Token non trouvé dans la réponse du backend");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Erreur lors du callback Auth0 :", err);
        navigate("/login", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  return null;
};

export default Callback;
