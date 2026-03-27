/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { authService as defaultAuthService } from "../services/authService";
import { IAuthService } from "../types/authService";

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  loading: boolean;
  error: string;
  login: (username: string, password: string, remember?: boolean) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  service?: IAuthService;
}

export const AuthProvider = ({ children, service = defaultAuthService }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("loggedIn") === "true"
  );
  const [username, setUsername] = useState(
    () => sessionStorage.getItem("username") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = useCallback(() => setError(""), []);

  const login = useCallback(
    async (user: string, password: string, remember = false): Promise<boolean> => {
      setLoading(true);
      setError("");
      try {
        const isValid = await service.login(user, password);
        setLoading(false);

        if (isValid) {
          sessionStorage.setItem("loggedIn", "true");
          sessionStorage.setItem("username", user);
          setIsLoggedIn(true);
          setUsername(user);

          if (remember) {
            localStorage.setItem("rememberedUser", user);
          } else {
            localStorage.removeItem("rememberedUser");
          }
          return true;
        }

        setError("Credenciales incorrectas");
        return false;
      } catch (err) {
        setLoading(false);
        setError("Error en la autenticación");
        return false;
      }
    },
    [service]
  );

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      const user = await service.loginWithPin(pin);
      setLoading(false);

      if (user) {
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("username", user);
        setIsLoggedIn(true);
        setUsername(user);
        return true;
      }

      setError("PIN incorrecto");
      return false;
    } catch (err) {
      setLoading(false);
      setError("Error en la autenticación");
      return false;
    }
  }, [service]);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        username,
        loading,
        error,
        login,
        loginWithPin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
