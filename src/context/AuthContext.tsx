/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { fakeAuth, fakePinAuth } from "../services/authService";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
      const isValid = await fakeAuth(user, password);
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
    },
    []
  );

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    setLoading(true);
    setError("");
    const user = await fakePinAuth(pin);
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
  }, []);

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
