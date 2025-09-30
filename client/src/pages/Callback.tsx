// src/pages/Callback.tsx
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
        navigate("/login", { replace: true });
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!codeVerifier) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 1) Échange code contre token côté backend. Backend met le cookie HttpOnly et retourne l'user.
        const postRes = await api.post(
          "/auth/callback",
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: window.location.origin + "/callback",
          },
          { withCredentials: true }
        );

        // Supprime le verifier, déjà utilisé
        sessionStorage.removeItem("pkce_code_verifier");

        // 2) Si backend retourne l'user, on l'utilise directement (évite la course)
        // ...
        if (postRes.data?.user) {
          setUser(postRes.data.user);
          setIsAuthenticated(true);
          navigate("/", { replace: true });
        } else {
          const res = await api.get("/users/me", { withCredentials: true });
          setUser(res.data);
          setIsAuthenticated(true);
          // 🚨 On navigue seulement après que /users/me ait fini
          navigate("/", { replace: true });
        }

        // 3) Clean URL and navigate
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Erreur callback Auth0 :", err);
        navigate("/login", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  return <p>Connexion en cours…</p>;
};

export default Callback;
