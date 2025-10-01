// src/services/authService.ts

import api from "../connect_to_api/api";

const API_BASE = process.env.REACT_APP_BASE_URL!;
const REDIRECT_URI = `${window.location.origin}/callback`;

export const login = async () => {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  window.location.href = `${API_BASE}/auth/login?code_challenge=${encodeURIComponent(
    codeChallenge
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
};

export const logout = async () => {
  try {
    // Appel à la déconnexion côté serveur, si nécessaire
    await api.post("/auth/logout");

    // Déconnexion d'Auth0 (cela met fin à la session Auth0)
    const auth0LogoutUrl = `https://${
      process.env.REACT_APP_AUTH0_DOMAIN
    }/v2/logout?client_id=${
      process.env.REACT_APP_AUTH0_CLIENT_ID
    }&returnTo=${encodeURIComponent(window.location.origin)}`;

    // Suppression du token et du code verifier
    sessionStorage.removeItem("auth_token"); // Supprimer le token
    sessionStorage.removeItem("pkce_code_verifier"); // Supprimer le verifier

    console.log("Redirecting to Auth0 logout URL:", auth0LogoutUrl);

    // Redirection vers Auth0 pour se déconnecter proprement
    window.location.href = auth0LogoutUrl; // Important : assurez-vous que ce redirige correctement
  } catch (err) {
    console.error("Erreur lors de la déconnexion", err);
  }
};

// PKCE helpers
export async function generateCodeVerifier(length = 128): Promise<string> {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let random = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    random += chars[array[i] % chars.length];
  }
  return random;
}

export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
