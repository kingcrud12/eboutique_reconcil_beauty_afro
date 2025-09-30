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
  const [authLoading, setAuthLoading] = useState(true); // À true au début, pour éviter les appels prématurés
  const [user, setUser] = useState<{ id: number; email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      // On vérifie si l'utilisateur est déjà authentifié
      const token = sessionStorage.getItem("auth_token");

      if (token) {
        try {
          const res = await api.get<{ id: number }>("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des infos utilisateur",
            error
          );
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    void init();
  }, []); // Un seul appel au chargement initial

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
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    window.location.href = `${API_BASE}/auth/login?code_challenge=${encodeURIComponent(
      codeChallenge
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  };

  // --- Logout ---
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      sessionStorage.removeItem("auth_token"); // Supprimer le token au logout
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false); // Réinitialise l'authentification
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

// Hook pour utiliser l'AuthContext
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};
