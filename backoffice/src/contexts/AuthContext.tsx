import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import api from "../api/api";

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  user: User | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    try {
      setAuthLoading(true);
      const { data } = await api.get<User>("/me");
      setUser(data);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      await api.post("/login", { email, password });
      await refreshUser();
    } catch (err) {
      console.error("Erreur login :", err);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      await api.post("/logout");
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, authLoading, user, refreshUser }}
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
