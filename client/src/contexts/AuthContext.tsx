// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import api from "../connect_to_api/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  authLoading: boolean;
  user: { id: number } | null; // <-- nouveau
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<{ exp: number }>(token);
          const now = Date.now() / 1000;
          if (decoded.exp < now) throw new Error("expired");

          setIsAuthenticated(true);

          // récupération de l'utilisateur connecté
          const res = await api.get<{ id: number }>("/users/me");
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setAuthLoading(false);
    };
    init();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);

    try {
      const res = await api.get<{ id: number }>("/users/me");
      setUser(res.data);
    } catch (error) {
      console.error("Erreur récupération user après login :", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, authLoading, user }}
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
