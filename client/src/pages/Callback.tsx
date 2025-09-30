import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        console.error("Pas de code reçu !");
        // If no code present, redirect to login page
        navigate("/login", { replace: true });
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!codeVerifier) {
        console.error("Pas de code verifier en session !");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Exchange code + code_verifier on backend -> backend sets HttpOnly cookie (JWT)
        await api.post(
          "/auth/callback",
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: window.location.origin + "/callback",
          },
          { withCredentials: true }
        );

        // remove verifier from storage (no longer needed)
        sessionStorage.removeItem("pkce_code_verifier");

        // Now backend cookie should be present; fetch profile
        const res = await api.get<{ id: number; email?: string }>("/users/me", {
          withCredentials: true,
        });

        // Update auth context
        setUser(res.data);
        setIsAuthenticated(true);

        // Navigate to home and replace history to clean URL
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Erreur callback Auth0 :", err);
        // Optionally show an error page or go back to login
        navigate("/login", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  return <p>Connexion en cours...</p>;
};

export default Callback;
