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

// --- PKCE helpers ---
async function generateCodeVerifier(length = 128): Promise<string> {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let random = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++)
    random += chars[array[i] % chars.length];
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

// --- Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      // Vérifie si un token est présent dans les cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="));

      // Si un token existe, on considère l'utilisateur comme authentifié
      if (token) {
        try {
          const res = await api.get<{ id: number }>("/users/me", {
            withCredentials: true,
          });
          setUser(res.data);
          setIsAuthenticated(true);
        } catch {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }

      setAuthLoading(false);
    };

    void init();
  }, []);

  const login = async () => {
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    window.location.href = `${API_BASE}/auth/login?code_challenge=${encodeURIComponent(
      codeChallenge
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
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
