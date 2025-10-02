// src/services/authService.ts

import api from "../api/api";

const API_BASE = process.env.REACT_APP_BASE_URL_Login!;
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
    await api.post("/auth/logout");
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
