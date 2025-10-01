import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../connect_to_api/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email?: string } | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<
    React.SetStateAction<{ id: number; email?: string } | null>
  >;
  login: () => void;
  logout: () => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.REACT_APP_BASE_URL!;
const REDIRECT_URI = `${window.location.origin}/callback`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Initialisation à true pour éviter les appels prématurés
  const [user, setUser] = useState<{ id: number; email?: string } | null>(null);

  useEffect(() => {
    // À l'initialisation, vérifier si l'utilisateur est déjà authentifié
    setAuthLoading(true);
    setIsAuthenticated(false); // Initialisation par défaut

    setAuthLoading(false); // Fin du chargement
  }, []);

  // --- PKCE helpers ---
  async function generateCodeVerifier(length = 128): Promise<string> {
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

  async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  // --- Login ---
  const login = async () => {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    // Enregistrer le code_verifier dans sessionStorage pour l'utiliser dans le callback
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);

    // Rediriger l'utilisateur vers l'URL de login
    window.location.href = `${API_BASE}/auth/login?code_challenge=${encodeURIComponent(
      codeChallenge
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  };

  // --- Logout ---
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setIsAuthenticated(false); // Réinitialiser l'authentification
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        setUser,
        login,
        logout,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};
