/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authService as defaultAuthService } from "../services/authService";
import { IAuthService } from "../types/authService";
import { UserRole } from "../types/user";
import { logService } from "../services/logService";

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
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
    () => sessionStorage.getItem("loggedIn") === "true"
  );
  const [username, setUsername] = useState(
    () => sessionStorage.getItem("username") || ""
  );
  const [role, setRole] = useState<UserRole | null>(
    () => (sessionStorage.getItem("role") as UserRole | null)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Seguridad Global de PIN (ISO 27001)
  const [attempts, setAttempts] = useState(() => 
    Number(sessionStorage.getItem("pin_attempts") || 0)
  );
  const [lockoutTime, setLockoutTime] = useState(0);

  // Seguridad Global de Login Clásico (ISO 27001)
  const [loginAttempts, setLoginAttempts] = useState(() => 
    Number(sessionStorage.getItem("login_attempts") || 0)
  );
  const [loginLockoutTime, setLoginLockoutTime] = useState(0);

  // Efecto para manejar el bloqueo persistente de PIN y Login
  useEffect(() => {
    const checkLockouts = () => {
      const now = Date.now();

      // Sincronización PIN
      const pinUntil = Number(sessionStorage.getItem("pin_lockout_until") || 0);
      const pinRemaining = Math.ceil((pinUntil - now) / 1000);
      if (pinRemaining > 0) {
        setLockoutTime(pinRemaining);
      } else {
        setLockoutTime(0);
        if (pinUntil > 0) {
          sessionStorage.removeItem("pin_lockout_until");
          sessionStorage.setItem("pin_attempts", "0");
          setAttempts(0);
        }
      }

      // Sincronización Login Clásico
      const loginUntil = Number(sessionStorage.getItem("login_lockout_until") || 0);
      const loginRemaining = Math.ceil((loginUntil - now) / 1000);
      if (loginRemaining > 0) {
        setLoginLockoutTime(loginRemaining);
      } else {
        setLoginLockoutTime(0);
        if (loginUntil > 0) {
          sessionStorage.removeItem("login_lockout_until");
          sessionStorage.setItem("login_attempts", "0");
          setLoginAttempts(0);
        }
      }
    };

    checkLockouts();
    const timer = setInterval(checkLockouts, 1000);
    return () => clearInterval(timer);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const login = useCallback(
    async (user: string, password: string, remember = false): Promise<boolean> => {
      // Verificar bloqueo comercial
      const until = Number(sessionStorage.getItem("login_lockout_until") || 0);
      if (until > Date.now()) {
        setError("Sistema bloqueado por múltiples intentos fallidos.");
        return false;
      }

      setLoading(true);
      setError("");
      try {
        const result = await service.login(user, password);
        setLoading(false);

        if (result.success && result.role) {
          sessionStorage.setItem("loggedIn", "true");
          sessionStorage.setItem("username", user);
          sessionStorage.setItem("role", result.role);
          
          // Reset de intentos
          sessionStorage.setItem("login_attempts", "0");
          setLoginAttempts(0);

          setIsLoggedIn(true);
          setUsername(user);
          setRole(result.role);

          // Log de auditoría (ISO 27001)
          logService.log(user, result.role, "LOGIN_PASSWORD", "Inicio de sesión con contraseña");

          if (remember) {
            localStorage.setItem("rememberedUser", user);
          } else {
            localStorage.removeItem("rememberedUser");
          }
          return true;
        }

        // Manejo de intentos fallidos
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        sessionStorage.setItem("login_attempts", newAttempts.toString());

        if (newAttempts >= 5) {
          const lockoutUntil = Date.now() + 60000; // 60 segundos
          sessionStorage.setItem("login_lockout_until", lockoutUntil.toString());
          setLoginLockoutTime(60);
          setError("Demasiados intentos. Bloqueado por 60 segundos.");
          logService.log(user || "unknown", null, "SECURITY_ALERT_LOGIN", "Bloqueo de login clásico activado tras 5 intentos fallidos", "warn");
        } else {
          setError(`Credenciales incorrectas. Intentos restantes: ${5 - newAttempts}`);
          logService.log(user || "unknown", null, "LOGIN_FAILED", `Intento de login fallido (${newAttempts}/5)`, "info");
        }

        return false;
      } catch {
        setLoading(false);
        setError("Error en la autenticación");
        return false;
      }
    },
    [service, loginAttempts]
  );

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    // Verificar si el sistema está bloqueado
    const until = Number(sessionStorage.getItem("pin_lockout_until") || 0);
    if (until > Date.now()) {
      setError(`Sistema bloqueado por seguridad.`);
      return false;
    }

    setLoading(true);
    setError("");
    try {
      const result = await service.loginWithPin(pin);
      setLoading(false);

      if (result) {
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("username", result.username);
        sessionStorage.setItem("role", result.role);
        setIsLoggedIn(true);
        setUsername(result.username);
        setRole(result.role);

        // Log de auditoría (ISO 27001)
        logService.log(result.username, result.role, "LOGIN_PIN", "Inicio de sesión con PIN");

        return true;
      }

      setError("PIN incorrecto");
      return false;
    } catch {
      setLoading(false);
      setError("Error en la autenticación");
      return false;
    }
  }, [service]);

  const logout = useCallback(() => {
    // Log antes de limpiar la sesión para tener los datos del usuario
    if (username) {
      logService.log(username, role, "LOGOUT", "Cierre de sesión de usuario");
    }

    sessionStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
    setRole(null);
  }, [username, role]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        username,
        role,
        loading,
        error,
        login,
        loginWithPin,
        logout,
        clearError,
        validatePinForAction,
        lockoutTime,
        loginLockoutTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
