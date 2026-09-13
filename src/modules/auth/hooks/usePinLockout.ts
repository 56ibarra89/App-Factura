import { useCallback, useEffect, useState } from "react";
import { logService } from "../../audit";
import { localStore } from "../../../shared/storage";

const STORAGE_LOCKOUT_UNTIL = "pin_server_lockout_until_v2";
const LEGACY_STORAGE_KEYS = [
  "pin_attempts",
  "pin_lockout_until",
  "pin_lockout_level",
] as const;

export interface PinLockoutState {
  lockoutTime: number;
  isLocked: boolean;
  applyServerLockout(lockoutSeconds: number): void;
  resetAttempts(): void;
}

function getLockoutUntil(): number {
  const value = Number(localStore.getItem(STORAGE_LOCKOUT_UNTIL) || 0);
  return Number.isFinite(value) ? value : 0;
}

function getRemainingLockoutSeconds(): number {
  return Math.max(
    0,
    Math.ceil((getLockoutUntil() - Date.now()) / 1000),
  );
}

export function usePinLockout(): PinLockoutState {
  const [lockoutTime, setLockoutTime] = useState(
    getRemainingLockoutSeconds,
  );

  useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach((key) => localStore.removeItem(key));

    const tick = () => {
      const until = getLockoutUntil();
      const remaining = getRemainingLockoutSeconds();
      setLockoutTime(remaining);
      if (remaining === 0 && until > 0) {
        localStore.removeItem(STORAGE_LOCKOUT_UNTIL);
      }
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, []);

  const applyServerLockout = useCallback((lockoutSeconds: number) => {
    const safeSeconds = Math.min(
      60,
      Math.max(1, Math.ceil(lockoutSeconds)),
    );
    localStore.setItem(
      STORAGE_LOCKOUT_UNTIL,
      String(Date.now() + safeSeconds * 1000),
    );
    setLockoutTime(safeSeconds);
    logService.log(
      "system",
      null,
      "SECURITY_ALERT_PIN",
      `Terminal con PIN pausada por ${safeSeconds} segundos según el servidor`,
      "warn",
    );
  }, []);

  const resetAttempts = useCallback(() => {
    setLockoutTime(0);
    localStore.removeItem(STORAGE_LOCKOUT_UNTIL);
    LEGACY_STORAGE_KEYS.forEach((key) => localStore.removeItem(key));
  }, []);

  return {
    lockoutTime,
    isLocked: lockoutTime > 0,
    applyServerLockout,
    resetAttempts,
  };
}
