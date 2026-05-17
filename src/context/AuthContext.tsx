/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { authService as defaultAuthService } from "../services/authService";
import { IAuthService } from "../types/authService";
import { UserRole } from "../types/user";
import { logService } from "../services/logService";
import { usePinLockout } from "../hooks/usePinLockout";
import { useLoginLockout } from "../hooks/useLoginLockout";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { localStore, sessionStore } from "../services/storage/storage";

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
  email: string;
  loading: boolean;
  error: string;
  login: (username: string, password: string, remember?: boolean) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  validatePinForAction: (pin: string) => Promise<{ success: boolean; error?: string }>;
  lockoutTime: number;
  loginLockoutTime: number;
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
    () => sessionStore.getItem("loggedIn") === "true"
  );
  const [username, setUsername] = useState(
    () => sessionStore.getItem("username") || ""
  );
  const [role, setRole] = useState<UserRole | null>(
    () => (sessionStore.getItem("role") as UserRole | null)
  );
  const [email, setEmail] = useState(
    () => sessionStore.getItem("email") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SRP: lógica de seguridad delegada a hooks especializados
  const pinLockout = usePinLockout();
  const loginLockout = useLoginLockout();

  const clearError = useCallback(() => setError(""), []);

  const logout = useCallback(() => {
    if (username) {
      logService.log(username, role, "LOGOUT", "Cierre de sesión de usuario");
    }
    sessionStore.clear();
    setIsLoggedIn(false);
    setUsername("");
    setRole(null);
    setEmail("");
  }, [username, role]);

  // SRP: timer de inactividad delegado a su propio hook
  useInactivityTimer({ isLoggedIn, username, role, onExpire: logout });

  const login = useCallback(
    async (user: string, password: string, remember = false): Promise<boolean> => {
      if (loginLockout.isLoginLocked) {
        setError("Sistema bloqueado por múltiples intentos fallidos.");
        return false;
      }

      setLoading(true);
      setError("");
      try {
        const result = await service.login(user, password);
        setLoading(false);

        if (result.success && result.role) {
          sessionStore.setItem("loggedIn", "true");
          sessionStore.setItem("username", user);
          sessionStore.setItem("role", result.role);
          if (result.email) sessionStore.setItem("email", result.email);
          loginLockout.resetLoginAttempts();

          setIsLoggedIn(true);
          setUsername(user);
          setRole(result.role);
          if (result.email) setEmail(result.email);
          sessionStore.setItem("lastActivity", Date.now().toString());

          logService.log(user, result.role, "LOGIN_PASSWORD", "Inicio de sesión con contraseña");

          if (remember) {
            localStore.setItem("rememberedUser", user);
          } else {
            localStore.removeItem("rememberedUser");
          }
          return true;
        }

        // Registrar intento fallido (el hook maneja contadores y logs)
        const locked = loginLockout.registerFailedLogin(user);
        if (locked) {
          setError("Demasiados intentos. Bloqueado por 60 segundos.");
        } else {
          setError(
            `Credenciales incorrectas. Intentos restantes: ${5 - loginLockout.loginAttempts - 1}`
          );
        }
        return false;
      } catch {
        setLoading(false);
        setError("Error en la autenticación");
        return false;
      }
    },
    [service, loginLockout]
  );

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    if (pinLockout.isLocked) {
      setError("Sistema bloqueado por seguridad.");
      return false;
    }

    setLoading(true);
    setError("");
    try {
      const result = await service.loginWithPin(pin);
      setLoading(false);

      if (result) {
        sessionStore.setItem("loggedIn", "true");
        sessionStore.setItem("username", result.username);
        sessionStore.setItem("role", result.role);
        pinLockout.resetAttempts();

        setIsLoggedIn(true);
        setUsername(result.username);
        setRole(result.role);
        sessionStore.setItem("lastActivity", Date.now().toString());

        logService.log(result.username, result.role, "LOGIN_PIN", "Inicio de sesión con PIN");
        return true;
      }

      const locked = pinLockout.registerFailedAttempt();
      if (locked) {
        setError("Demasiados intentos fallidos. Bloqueado por 30 segundos.");
      } else {
        setError(`PIN incorrecto. Intentos restantes: ${3 - pinLockout.attempts - 1}`);
      }
      return false;
    } catch {
      setLoading(false);
      setError("Error en la autenticación");
      return false;
    }
  }, [service, pinLockout]);

  const validatePinForAction = useCallback(
    async (pin: string): Promise<{ success: boolean; error?: string }> => {
      if (pinLockout.isLocked) {
        return { success: false, error: "Sistema bloqueado por seguridad" };
      }

      try {
        const result = await service.loginWithPin(pin);

        if (result && (result.role === "admin" || result.username === "admin")) {
          pinLockout.resetAttempts();
          return { success: true };
        }

        const locked = pinLockout.registerFailedAttempt();
        if (locked) {
          return {
            success: false,
            error: "Demasiados intentos fallidos. Bloqueado por 30 segundos.",
          };
        }

        const errorMsg = result
          ? "Este usuario no tiene permisos de administrador."
          : `PIN incorrecto. Intentos restantes: ${3 - pinLockout.attempts - 1}`;
        return { success: false, error: errorMsg };
      } catch {
        return { success: false, error: "Error en la validación" };
      }
    },
    [service, pinLockout]
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        username,
        role,
        email,
        loading,
        error,
        login,
        loginWithPin,
        logout,
        clearError,
        validatePinForAction,
        lockoutTime: pinLockout.lockoutTime,
        loginLockoutTime: loginLockout.loginLockoutTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
