import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../connect_to_api/api";
import {
  login as authLogin,
  logout as authLogout,
} from "../connect_to_api/authService"; // Importation des méthodes login et logout

interface User {
  id: number;
  email?: string;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  login: (state?: string) => Promise<void>; // Ajout de login dans le contexte
  logout: () => Promise<void>; // Ajout de logout dans le contexte
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Vérifie le token avec le backend
      api
        .get("/users/me")
        .then((res) => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
          setUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  // Fonction de login
  const login = async () => {
    try {
      await authLogin(); // Appel de la méthode login depuis authService
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Erreur lors de la connexion", err);
      setIsAuthenticated(false);
    }
  };

  // Fonction de logout
  const logout = async () => {
    try {
      await authLogout(); // Appel de la méthode logout depuis authService
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("auth_token");
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        setUser,
        setIsAuthenticated,
        login,
        logout,
      }} // Passer login et logout dans le contexte
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
