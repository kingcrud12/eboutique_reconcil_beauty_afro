// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import api from "../api/api";

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
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: number } | null>(null);

  const login = async () => {
    try {
      setAuthLoading(true);
      const res = await api.get<{ id: number }>("/admin/orders");
      setUser(res.data);
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
      await api.post("/admin/logout");
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

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};
