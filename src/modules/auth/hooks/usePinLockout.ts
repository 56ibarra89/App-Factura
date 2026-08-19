import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { logService } from "../../audit";
import { sessionStore } from "../../../shared/storage";

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATIONS_MS = [
  30_000,
  60_000,
  120_000,
  300_000,
] as const;
const STORAGE_ATTEMPTS = "pin_attempts";
const STORAGE_LOCKOUT_UNTIL = "pin_lockout_until";
const STORAGE_LOCKOUT_LEVEL = "pin_lockout_level";

export interface PinLockoutState {
  attempts: number;
  lockoutTime: number;
  isLocked: boolean;
  registerFailedAttempt: () => {
    locked: boolean;
    remainingAttempts: number;
    lockoutSeconds: number;
  };
  resetAttempts: () => void;
}

function getStoredAttempts(): number {
  const value = Number(
    sessionStore.getItem(STORAGE_ATTEMPTS) || 0,
  );
  return Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function getLockoutUntil(): number {
  const value = Number(
    sessionStore.getItem(STORAGE_LOCKOUT_UNTIL) || 0,
  );
  return Number.isFinite(value) ? value : 0;
}

function getStoredLockoutLevel(): number {
  const value = Number(
    sessionStore.getItem(STORAGE_LOCKOUT_LEVEL) || 0,
  );
  return Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function getLockoutDuration(level: number): number {
  const durationIndex = Math.min(
    level,
    LOCKOUT_DURATIONS_MS.length - 1,
  );
  return LOCKOUT_DURATIONS_MS[durationIndex];
}

function getRemainingLockoutSeconds(): number {
  return Math.max(
    0,
    Math.ceil((getLockoutUntil() - Date.now()) / 1000),
  );
}

export function usePinLockout(): PinLockoutState {
  const [attempts, setAttempts] = useState<number>(
    getStoredAttempts,
  );
  const [lockoutTime, setLockoutTime] = useState(
    getRemainingLockoutSeconds,
  );

  useEffect(() => {
    const tick = () => {
      const until = getLockoutUntil();
      const remaining = getRemainingLockoutSeconds();
      if (remaining > 0) {
        setLockoutTime(remaining);
      } else {
        setLockoutTime(0);
        if (until > 0) {
          sessionStore.removeItem(STORAGE_LOCKOUT_UNTIL);
          sessionStore.setItem(STORAGE_ATTEMPTS, "0");
          setAttempts(0);
        }
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const registerFailedAttempt = useCallback(() => {
    const newAttempts = getStoredAttempts() + 1;
    setAttempts(newAttempts);
    sessionStore.setItem(
      STORAGE_ATTEMPTS,
      newAttempts.toString(),
    );

    if (newAttempts >= MAX_ATTEMPTS) {
      const currentLevel = getStoredLockoutLevel();
      const lockoutDuration = getLockoutDuration(currentLevel);
      const lockoutSeconds = lockoutDuration / 1000;
      const until = Date.now() + lockoutDuration;
      sessionStore.setItem(
        STORAGE_LOCKOUT_UNTIL,
        until.toString(),
      );
      sessionStore.setItem(
        STORAGE_LOCKOUT_LEVEL,
        Math.min(
          currentLevel + 1,
          LOCKOUT_DURATIONS_MS.length - 1,
        ).toString(),
      );
      setLockoutTime(lockoutSeconds);
      logService.log(
        "system",
        null,
        "SECURITY_ALERT_PIN",
        `Bloqueo global de PIN activado por ${lockoutSeconds} segundos tras ${MAX_ATTEMPTS} intentos`,
        "warn"
      );
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutSeconds,
      };
    }
    return {
      locked: false,
      remainingAttempts: MAX_ATTEMPTS - newAttempts,
      lockoutSeconds: 0,
    };
  }, []);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    setLockoutTime(0);
    sessionStore.setItem(STORAGE_ATTEMPTS, "0");
    sessionStore.removeItem(STORAGE_LOCKOUT_UNTIL);
    sessionStore.removeItem(STORAGE_LOCKOUT_LEVEL);
  }, []);

  const isLocked = lockoutTime > 0;

  return {
    attempts,
    lockoutTime,
    isLocked,
    registerFailedAttempt,
    resetAttempts,
  };
}

