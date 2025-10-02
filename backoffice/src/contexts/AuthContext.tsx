// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../api/api";
import { login, logout } from "../api/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email?: string } | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<
    React.SetStateAction<{ id: number; email?: string } | null>
  >;
  authLoading: boolean;
  login: () => void; // Ajout de la fonction login
  logout: () => void; // Ajout de la fonction logout
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);
      try {
        const token = sessionStorage.getItem("auth_token");
        if (token) {
          const res = await api.get<{ id: number }>("/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          setUser(res.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des infos utilisateur",
          error
        );
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    void init();
  }, []);

  // Gestion du login et du logout
  const handleLogin = () => login();
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        setUser,
        authLoading,
        login: handleLogin,
        logout: handleLogout,
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
