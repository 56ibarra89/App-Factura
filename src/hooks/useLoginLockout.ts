import { useState, useEffect } from "react";
import { logService } from "../services/logService";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000; // 60 segundos
const STORAGE_ATTEMPTS = "login_attempts";
const STORAGE_LOCKOUT_UNTIL = "login_lockout_until";

export interface LoginLockoutState {
  loginAttempts: number;
  loginLockoutTime: number;
  isLoginLocked: boolean;
  registerFailedLogin: (username?: string) => boolean; // retorna true si se activó el lockout
  resetLoginAttempts: () => void;
}

/**
 * Hook de responsabilidad única (SRP):
 * Gestiona exclusivamente la política de bloqueo por intentos fallidos de login clásico.
 */
export function useLoginLockout(): LoginLockoutState {
  const [loginAttempts, setLoginAttempts] = useState<number>(
    () => Number(sessionStorage.getItem(STORAGE_ATTEMPTS) || 0)
  );
  const [loginLockoutTime, setLoginLockoutTime] = useState(0);

  // Sincroniza el countdown del lockout cada segundo
  useEffect(() => {
    const tick = () => {
      const until = Number(sessionStorage.getItem(STORAGE_LOCKOUT_UNTIL) || 0);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setLoginLockoutTime(remaining);
      } else {
        setLoginLockoutTime(0);
        if (until > 0) {
          sessionStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
          sessionStorage.setItem(STORAGE_ATTEMPTS, "0");
          setLoginAttempts(0);
        }
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const registerFailedLogin = (username?: string): boolean => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    sessionStorage.setItem(STORAGE_ATTEMPTS, newAttempts.toString());

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(STORAGE_LOCKOUT_UNTIL, until.toString());
      setLoginLockoutTime(LOCKOUT_DURATION_MS / 1000);
      logService.log(
        username || "unknown",
        null,
        "SECURITY_ALERT_LOGIN",
        `Bloqueo de login clásico activado tras ${MAX_LOGIN_ATTEMPTS} intentos fallidos`,
        "warn"
      );
      return true; // lockout activado
    }

    logService.log(
      username || "unknown",
      null,
      "LOGIN_FAILED",
      `Intento de login fallido (${newAttempts}/${MAX_LOGIN_ATTEMPTS})`,
      "info"
    );
    return false;
  };

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
    sessionStorage.setItem(STORAGE_ATTEMPTS, "0");
  };

  const isLoginLocked =
    Date.now() < Number(sessionStorage.getItem(STORAGE_LOCKOUT_UNTIL) || 0);

  return {
    loginAttempts,
    loginLockoutTime,
    isLoginLocked,
    registerFailedLogin,
    resetLoginAttempts,
  };
}
