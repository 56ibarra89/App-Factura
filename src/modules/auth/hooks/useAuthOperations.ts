import { useCallback, useState } from "react";
import type { IAuthService } from "../model/auth-service.types";
import type { AuthPreferencesGateway } from "../api/authPreferencesGateway";
import type { SecureTokenGateway } from "../api/secureTokenGateway";
import { logService } from "../../audit";
import type { LoginLockoutState } from "./useLoginLockout";
import type { PinLockoutState } from "./usePinLockout";
import type { AuthSessionController } from "./useAuthSession";

export interface PinValidationResult {
  success: boolean;
  error?: string;
}

interface UseAuthOperationsOptions {
  service: IAuthService;
  session: AuthSessionController;
  loginLockout: LoginLockoutState;
  pinLockout: PinLockoutState;
  tokenGateway: SecureTokenGateway;
  preferencesGateway: AuthPreferencesGateway;
}

export function useAuthOperations({
  service,
  session,
  loginLockout,
  pinLockout,
  tokenGateway,
  preferencesGateway,
}: UseAuthOperationsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    state: sessionState,
    signIn,
    signOut,
  } = session;

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const logout = useCallback(() => {
    const { username, role } = sessionState;
    if (username) {
      logService.log(
        username,
        role,
        "LOGOUT",
        "Cierre de sesión de usuario",
      );
    }

    tokenGateway.clear();
    signOut();
  }, [
    sessionState,
    signOut,
    tokenGateway,
  ]);

  const login = useCallback(
    async (
      username: string,
      password: string,
      remember = false,
    ): Promise<boolean> => {
      if (loginLockout.isLoginLocked) {
        setError(
          "Sistema bloqueado por múltiples intentos fallidos.",
        );
        return false;
      }

      setLoading(true);
      setError("");

      try {
        const result = await service.login(
          username,
          password,
        );

        if (result.success && result.role) {
          const actualUsername =
            result.username || username;

          if (result.access_token) {
            tokenGateway.store(result.access_token);
          }
          preferencesGateway.applyTheme(
            result.themePreference === "dark"
              ? "dark"
              : "light",
          );
          preferencesGateway.rememberUsername(
            username,
            remember,
          );
          loginLockout.resetLoginAttempts();
          signIn({
            username: actualUsername,
            role: result.role,
            email: result.email || "",
            firstName: result.firstName || "",
            lastName: result.lastName || "",
          });

          logService.log(
            username,
            result.role,
            "LOGIN_PASSWORD",
            "Inicio de sesión con contraseña",
          );
          return true;
        }

        const locked =
          loginLockout.registerFailedLogin(username);
        setError(
          locked
            ? "Demasiados intentos. Bloqueado por 60 segundos."
            : `Credenciales incorrectas. Intentos restantes: ${
                5 - loginLockout.loginAttempts - 1
              }`,
        );
        return false;
      } catch {
        setError("Error en la autenticación");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      loginLockout,
      preferencesGateway,
      service,
      signIn,
      tokenGateway,
    ],
  );

  const loginWithPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (pinLockout.isLocked) {
        setError("Sistema bloqueado por seguridad.");
        return false;
      }

      setLoading(true);
      setError("");

      try {
        const result = await service.loginWithPin(pin);

        if (result) {
          if (result.access_token) {
            tokenGateway.store(result.access_token);
          }
          preferencesGateway.applyTheme(
            result.themePreference === "dark"
              ? "dark"
              : "light",
          );
          pinLockout.resetAttempts();
          signIn({
            username: result.username,
            role: result.role,
            email: "",
            firstName: result.firstName,
            lastName: result.lastName,
          });

          logService.log(
            result.username,
            result.role,
            "LOGIN_PIN",
            "Inicio de sesión con PIN",
          );
          return true;
        }

        const locked = pinLockout.registerFailedAttempt();
        setError(
          locked
            ? "Demasiados intentos fallidos. Bloqueado por 30 segundos."
            : `PIN incorrecto. Intentos restantes: ${
                3 - pinLockout.attempts - 1
              }`,
        );
        return false;
      } catch {
        setError("Error en la autenticación");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      pinLockout,
      preferencesGateway,
      service,
      signIn,
      tokenGateway,
    ],
  );

  const validatePinForAction = useCallback(
    async (pin: string): Promise<PinValidationResult> => {
      if (pinLockout.isLocked) {
        return {
          success: false,
          error: "Sistema bloqueado por seguridad",
        };
      }

      try {
        const result = await service.loginWithPin(pin);
        if (
          result &&
          (result.role === "admin" ||
            result.username === "admin")
        ) {
          pinLockout.resetAttempts();
          return { success: true };
        }

        const locked = pinLockout.registerFailedAttempt();
        if (locked) {
          return {
            success: false,
            error:
              "Demasiados intentos fallidos. Bloqueado por 30 segundos.",
          };
        }

        return {
          success: false,
          error: result
            ? "Este usuario no tiene permisos de administrador."
            : `PIN incorrecto. Intentos restantes: ${
                3 - pinLockout.attempts - 1
              }`,
        };
      } catch {
        return {
          success: false,
          error: "Error en la validación",
        };
      }
    },
    [pinLockout, service],
  );

  return {
    loading,
    error,
    clearError,
    login,
    loginWithPin,
    logout,
    validatePinForAction,
  };
}
