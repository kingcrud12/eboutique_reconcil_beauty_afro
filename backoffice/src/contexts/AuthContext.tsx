// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email: string; role?: string } | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

interface JwtPayload {
  sub: number;
  email: string;
  role?: string;
  exp: number; // secondes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAuth() {
  const token = localStorage.getItem('token');
  if (!token) return { isAuthenticated: false, user: null, token: null };

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 <= Date.now()) {
      localStorage.removeItem('token');
      return { isAuthenticated: false, user: null, token: null };
    }
    return {
      isAuthenticated: true,
      user: { id: decoded.sub, email: decoded.email, role: decoded.role },
      token,
    };
  } catch {
    localStorage.removeItem('token');
    return { isAuthenticated: false, user: null, token: null };
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(getInitialAuth);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode<JwtPayload>(token);
    setState({
      isAuthenticated: true,
      user: { id: decoded.sub, email: decoded.email, role: decoded.role },
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({ isAuthenticated: false, user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
