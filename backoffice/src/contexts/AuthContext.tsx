import React, { createContext, useContext, useState, ReactNode } from "react";
import api from "../api/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  user: { id: number; email: string; role: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    role: string;
  } | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      await api.post("/login", { email, password });
      setIsAuthenticated(true);
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
      await api.post("/admin/logout"); // supprime le cookie côté serveur
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};
