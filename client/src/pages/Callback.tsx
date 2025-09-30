import React, { useEffect } from "react";
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
        // 1) Échange code contre token côté backend
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

        // Si backend retourne l'utilisateur, on met à jour le contexte
        if (postRes.data?.user) {
          setUser(postRes.data.user);
          setIsAuthenticated(true);
          navigate("/", { replace: true });
        } else {
          const res = await api.get("/users/me", { withCredentials: true });
          setUser(res.data);
          setIsAuthenticated(true);
          navigate("/", { replace: true });
        }
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
