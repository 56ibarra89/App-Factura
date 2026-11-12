import { useState, useEffect, useCallback } from "react";
import { logService } from "../../audit";
import { localStore } from "../../../shared/storage";

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

function getRemainingLoginLockoutSeconds(): number {
  const until = Number(localStore.getItem(STORAGE_LOCKOUT_UNTIL) || 0);
  if (!Number.isFinite(until) || until <= 0) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export function useLoginLockout(): LoginLockoutState {
  const [loginAttempts, setLoginAttempts] = useState<number>(
    () => Number(localStore.getItem(STORAGE_ATTEMPTS) || 0),
  );
  const [loginLockoutTime, setLoginLockoutTime] = useState<number>(
    getRemainingLoginLockoutSeconds,
  );

  useEffect(() => {
    if (loginLockoutTime <= 0) return;

    const tick = () => {
      const until = Number(localStore.getItem(STORAGE_LOCKOUT_UNTIL) || 0);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setLoginLockoutTime(remaining);
      } else {
        setLoginLockoutTime(0);
        if (until > 0) {
          localStore.removeItem(STORAGE_LOCKOUT_UNTIL);
          localStore.setItem(STORAGE_ATTEMPTS, "0");
          setLoginAttempts(0);
        }
      }
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [loginLockoutTime]);

  const registerFailedLogin = useCallback(
    (username?: string): boolean => {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStore.setItem(STORAGE_ATTEMPTS, newAttempts.toString());

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        localStore.setItem(STORAGE_LOCKOUT_UNTIL, until.toString());
        setLoginLockoutTime(LOCKOUT_DURATION_MS / 1000);
        logService.log(
          username || "unknown",
          null,
          "SECURITY_ALERT_LOGIN",
          `Bloqueo de login clásico activado tras ${MAX_LOGIN_ATTEMPTS} intentos fallidos`,
          "warn",
        );
        return true;
      }

      logService.log(
        username || "unknown",
        null,
        "LOGIN_FAILED",
        `Intento de login fallido (${newAttempts}/${MAX_LOGIN_ATTEMPTS})`,
        "info",
      );
      return false;
    },
    [loginAttempts],
  );

  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0);
    setLoginLockoutTime(0);
    localStore.removeItem(STORAGE_LOCKOUT_UNTIL);
    localStore.setItem(STORAGE_ATTEMPTS, "0");
  }, []);

  const isLoginLocked = loginLockoutTime > 0;

  return {
    loginAttempts,
    loginLockoutTime,
    isLoginLocked,
    registerFailedLogin,
    resetLoginAttempts,
  };
}
