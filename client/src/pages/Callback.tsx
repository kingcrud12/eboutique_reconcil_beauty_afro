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

      // Récupérer et sécuriser l'URL de redirection
      const rawState = params.get("state") || "/";
      const redirectUrl =
        typeof rawState === "string" && rawState.startsWith("/")
          ? rawState
          : "/";

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
        const res = await api.post("/auth/callback", {
          code,
          code_verifier: codeVerifier,
          redirect_uri: window.location.origin + "/callback",
        });

        sessionStorage.removeItem("pkce_code_verifier");

        const { token } = res.data;

        if (token) {
          localStorage.setItem("auth_token", token);

          const userRes = await api.get("/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const user = userRes.data;

          if (user) {
            setUser(user);
            setIsAuthenticated(true);
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
