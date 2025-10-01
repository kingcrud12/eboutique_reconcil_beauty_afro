import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../connect_to_api/api";

const Callback = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, authLoading } = useAuth();

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
        const postRes = await api.post(
          "/auth/callback",
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: window.location.origin + "/callback",
          },
          { withCredentials: true }
        );

        sessionStorage.removeItem("pkce_code_verifier");

        if (postRes.data?.user) {
          // Lorsqu'un utilisateur Auth0 est authentifié, vérifiez ou créez un utilisateur dans votre base de données
          const user = postRes.data.user;

          // Si l'utilisateur existe dans votre base de données, vous pouvez le récupérer
          const existingUserRes = await api.get(`/users/me`);

          if (!existingUserRes.data) {
            // Si l'utilisateur n'existe pas, créez-le dans votre base de données interne
            await api.post("/users", {
              email: user.email,
              userId: user.id,
              // Ajouter d'autres informations nécessaires
            });
          }

          // Assurez-vous que l'utilisateur est ajouté dans votre contexte et redirigez-le
          setUser(user);
          setIsAuthenticated(true);
          sessionStorage.setItem("auth_token", postRes.data.token);
          console.log("auth_token:", sessionStorage.getItem("auth_token"));
          navigate("/", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Erreur lors du callback Auth0 :", err);
        navigate("/login", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  if (authLoading) {
    return <p>Connexion en cours…</p>;
  }

  return null;
};

export default Callback;
