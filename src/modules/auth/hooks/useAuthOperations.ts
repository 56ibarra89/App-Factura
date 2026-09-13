import { useCallback, useState } from "react";
import type { IAuthService } from "../model/auth-service.types";
import type { AuthPreferencesGateway } from "../api/authPreferencesGateway";
import type { SecureTokenGateway } from "../api/secureTokenGateway";
import { logService } from "../../audit";
import type { LoginLockoutState } from "./useLoginLockout";
import type { PinLockoutState } from "./usePinLockout";
import type { AuthSessionController } from "./useAuthSession";
import type { LogoutResult } from "../model/auth-service.types";

export interface PinValidationResult {
  success: boolean;
  error?: string;
}

function getAuthenticationError(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Error en la autenticación";
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
  const {
    isLocked: isPinLocked,
    applyServerLockout,
    resetAttempts: resetPinAttempts,
  } = pinLockout;

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const completeLogout = useCallback(async () => {
    const { username, role } = sessionState;
    if (username) {
      logService.log(
        username,
        role,
        "LOGOUT",
        "Cierre de sesión de usuario",
      );
    }

    await tokenGateway.clear();
    signOut();
  }, [
    sessionState,
    signOut,
    tokenGateway,
  ]);

  const logout = useCallback(async (): Promise<LogoutResult> => {
    const result = await service.logout();
    await completeLogout();
    return result.success ? result : { success: true };
  }, [completeLogout, service]);

  const logoutAllDevices = useCallback(async (): Promise<LogoutResult> => {
    const result = await service.logoutAllDevices();
    if (!result.success) return result;

    await completeLogout();
    return result;
  }, [completeLogout, service]);

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
            await tokenGateway.store(result.access_token);
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

        if (result.errorMessage) {
          setError(result.errorMessage);
          return false;
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
      } catch (err: unknown) {
        setError(getAuthenticationError(err));
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
      if (isPinLocked) {
        setError("Sistema bloqueado por seguridad.");
        return false;
      }

      setLoading(true);
      setError("");

      try {
        const result = await service.loginWithPin(pin);

        if (result.success) {
          if (result.access_token) {
            await tokenGateway.store(result.access_token);
          }
          preferencesGateway.applyTheme(
            result.themePreference === "dark"
              ? "dark"
              : "light",
          );
          resetPinAttempts();
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

        if (result.retryAfterSeconds) {
          applyServerLockout(result.retryAfterSeconds);
          setError(
            `PIN incorrecto. Reintenta en ${result.retryAfterSeconds} segundos.`,
          );
        } else {
          setError(result.errorMessage || "No fue posible validar el PIN.");
        }
        return false;
      } catch (err: unknown) {
        setError(getAuthenticationError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      isPinLocked,
      applyServerLockout,
      preferencesGateway,
      resetPinAttempts,
      service,
      signIn,
      tokenGateway,
    ],
  );

  const validatePinForAction = useCallback(
    async (pin: string): Promise<PinValidationResult> => {
      if (isPinLocked) {
        return {
          success: false,
          error: "Sistema bloqueado por seguridad",
        };
      }

      try {
        const result = await service.loginWithPin(pin);
        if (
          result.success &&
          (result.role === "admin" || result.username === "admin")
        ) {
          resetPinAttempts();
          return { success: true };
        }

        if (!result.success && result.retryAfterSeconds) {
          applyServerLockout(result.retryAfterSeconds);
          return {
            success: false,
            error: `PIN incorrecto. Reintenta en ${result.retryAfterSeconds} segundos.`,
          };
        }

        return {
          success: false,
          error: result.success
            ? "Este usuario no tiene permisos de administrador."
            : result.errorMessage || "No fue posible validar el PIN.",
        };
      } catch {
        return {
          success: false,
          error: "Error en la validación",
        };
      }
    },
    [
      isPinLocked,
      applyServerLockout,
      resetPinAttempts,
      service,
    ],
  );

  return {
    loading,
    error,
    clearError,
    login,
    loginWithPin,
    logout,
    logoutAllDevices,
    validatePinForAction,
  };
}
