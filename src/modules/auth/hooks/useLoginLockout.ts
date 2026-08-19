import { useState, useEffect } from "react";
import { logService } from "../../audit";
import { sessionStore } from "../../../shared/storage";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000;
const STORAGE_ATTEMPTS = "login_attempts";
const STORAGE_LOCKOUT_UNTIL = "login_lockout_until";

export interface LoginLockoutState {
  loginAttempts: number;
  loginLockoutTime: number;
  isLoginLocked: boolean;
  registerFailedLogin: (username?: string) => boolean;
  resetLoginAttempts: () => void;
}

export function useLoginLockout(): LoginLockoutState {
  const [loginAttempts, setLoginAttempts] = useState<number>(
    () => Number(sessionStore.getItem(STORAGE_ATTEMPTS) || 0)
  );
  const [loginLockoutTime, setLoginLockoutTime] = useState(0);

  useEffect(() => {
    const tick = () => {
      const until = Number(sessionStore.getItem(STORAGE_LOCKOUT_UNTIL) || 0);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setLoginLockoutTime(remaining);
      } else {
        setLoginLockoutTime(0);
        if (until > 0) {
          sessionStore.removeItem(STORAGE_LOCKOUT_UNTIL);
          sessionStore.setItem(STORAGE_ATTEMPTS, "0");
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
    sessionStore.setItem(STORAGE_ATTEMPTS, newAttempts.toString());

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      sessionStore.setItem(STORAGE_LOCKOUT_UNTIL, until.toString());
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
    sessionStore.setItem(STORAGE_ATTEMPTS, "0");
  };

  const isLoginLocked =
    Date.now() < Number(sessionStore.getItem(STORAGE_LOCKOUT_UNTIL) || 0);

  return {
    loginAttempts,
    loginLockoutTime,
    isLoginLocked,
    registerFailedLogin,
    resetLoginAttempts,
  };
}

