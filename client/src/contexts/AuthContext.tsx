import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../connect_to_api/api";

interface User {
  id: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const res = await api.get<User>("/users/me");
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {
    try {
      const res = await api.get<User>("/users/me");
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
      await api.post("/users/logout");
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
