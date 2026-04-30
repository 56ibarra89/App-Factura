import { useState, useEffect } from "react";
import { logService } from "../services/logService";

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30_000; // 30 segundos
const STORAGE_ATTEMPTS = "pin_attempts";
const STORAGE_LOCKOUT_UNTIL = "pin_lockout_until";

export interface PinLockoutState {
  attempts: number;
  lockoutTime: number;
  isLocked: boolean;
  registerFailedAttempt: () => boolean; // retorna true si se activó el lockout
  resetAttempts: () => void;
}

/**
 * Hook de responsabilidad única (SRP):
 * Gestiona exclusivamente la política de bloqueo por intentos fallidos de PIN.
 */
export function usePinLockout(): PinLockoutState {
  const [attempts, setAttempts] = useState<number>(
    () => Number(sessionStorage.getItem(STORAGE_ATTEMPTS) || 0)
  );
  const [lockoutTime, setLockoutTime] = useState(0);

  // Sincroniza el countdown del lockout cada segundo
  useEffect(() => {
    const tick = () => {
      const until = Number(sessionStorage.getItem(STORAGE_LOCKOUT_UNTIL) || 0);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutTime(remaining);
      } else {
        setLockoutTime(0);
        if (until > 0) {
          sessionStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
          sessionStorage.setItem(STORAGE_ATTEMPTS, "0");
          setAttempts(0);
        }
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const registerFailedAttempt = (): boolean => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    sessionStorage.setItem(STORAGE_ATTEMPTS, newAttempts.toString());

    if (newAttempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(STORAGE_LOCKOUT_UNTIL, until.toString());
      setLockoutTime(LOCKOUT_DURATION_MS / 1000);
      logService.log(
        "system",
        null,
        "SECURITY_ALERT_PIN",
        `Bloqueo global de PIN activado tras ${MAX_ATTEMPTS} intentos`,
        "warn"
      );
      return true; // lockout activado
    }
    return false;
  };

  const resetAttempts = () => {
    setAttempts(0);
    sessionStorage.setItem(STORAGE_ATTEMPTS, "0");
  };

  const isLocked =
    Date.now() < Number(sessionStorage.getItem(STORAGE_LOCKOUT_UNTIL) || 0);

  return { attempts, lockoutTime, isLocked, registerFailedAttempt, resetAttempts };
}
