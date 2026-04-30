import { useCallback, useEffect } from "react";
import { logService } from "../services/logService";
import { UserRole } from "../types/user";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutos
const CHECK_INTERVAL_MS = 30_000; // Revisar cada 30s
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
] as const;

interface UseInactivityTimerOptions {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
  onExpire: () => void;
}

/**
 * Hook de responsabilidad única (SRP):
 * Gestiona exclusivamente la detección de inactividad de sesión y el cierre automático.
 */
export function useInactivityTimer({
  isLoggedIn,
  username,
  role,
  onExpire,
}: UseInactivityTimerOptions): void {
  const resetTimer = useCallback(() => {
    if (!isLoggedIn) return;
    sessionStorage.setItem("lastActivity", Date.now().toString());
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkInactivity = () => {
      const last = Number(sessionStorage.getItem("lastActivity") || Date.now());
      if (Date.now() - last > INACTIVITY_LIMIT_MS) {
        logService.log(
          username,
          role,
          "SESSION_EXPIRED",
          "Cierre de sesión automático por inactividad"
        );
        onExpire();
      }
    };

    const handleActivity = () => resetTimer();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );
    const interval = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInterval(interval);
    };
  }, [isLoggedIn, username, role, onExpire, resetTimer]);
}
