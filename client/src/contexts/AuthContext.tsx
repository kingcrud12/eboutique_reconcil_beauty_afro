// AuthContext.tsx
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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  user: { id: number } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: number } | null>(null);

  // Vérifie automatiquement si l'utilisateur est connecté
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get<{ id: number }>("/users/me"); // cookie envoyé automatiquement
        setUser(res.data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    init();
  }, []);

  const login = async () => {
    try {
      const res = await api.get<{ id: number }>("/users/me"); // après login côté serveur, cookie HttpOnly est présent
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Erreur login :", err);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/users/logout"); // tu peux créer un endpoint qui clear le cookie côté serveur
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
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
