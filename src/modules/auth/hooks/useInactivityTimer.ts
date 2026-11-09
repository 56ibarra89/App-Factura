import { useCallback, useEffect, useRef } from "react";
import { logService } from "../../audit";
import { UserRole } from "../model/user.types";
import type { AuthSessionGateway } from "../api/authSessionGateway";
import { authSessionGateway } from "../api/authSessionGateway";
import type { LogoutResult } from "../model/auth-service.types";

// Tiempo límite de inactividad: 30 minutos
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 30_000;
const ACTIVITY_TOUCH_THROTTLE_MS = 5_000;
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "pointerdown",
  "pointermove",
  "click",
] as const;

interface UseInactivityTimerOptions {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
  onExpire: () => Promise<LogoutResult>;
}

export function useInactivityTimer(
  {
    isLoggedIn,
    username,
    role,
    onExpire,
  }: UseInactivityTimerOptions,
  gateway: AuthSessionGateway = authSessionGateway,
): void {
  const lastTouchRef = useRef<number>(0);

  const resetTimer = useCallback(() => {
    if (!isLoggedIn) return;
    const now = Date.now();
    if (now - lastTouchRef.current < ACTIVITY_TOUCH_THROTTLE_MS) {
      return;
    }
    lastTouchRef.current = now;
    gateway.touch();
  }, [gateway, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Los cocineros operan de forma continua en cocina sin interacción constante de ratón/teclado.
    if (role === "cocinero") return;

    const isKdsRoute = () => window.location.hash.includes("kds");

    if (gateway.getLastActivity() === null) {
      lastTouchRef.current = Date.now();
      gateway.touch();
    }

    const checkInactivity = () => {
      if (isKdsRoute()) {
        gateway.touch();
        return;
      }
      const last = gateway.getLastActivity();
      if (last === null) {
        gateway.touch();
        return;
      }
      if (Date.now() - last > INACTIVITY_LIMIT_MS) {
        void onExpire().then((result) => {
          if (result.success) {
            logService.log(
              username,
              role,
              "SESSION_EXPIRED",
              "Cierre de sesión automático por inactividad",
            );
          } else {
            gateway.touch();
          }
        });
      }
    };

    const handleActivity = () => resetTimer();
    const handleHashChange = () => {
      lastTouchRef.current = Date.now();
      gateway.touch();
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );
    window.addEventListener("hashchange", handleHashChange);
    checkInactivity();
    const interval = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
      window.removeEventListener("hashchange", handleHashChange);
      clearInterval(interval);
    };
  }, [gateway, isLoggedIn, username, role, onExpire, resetTimer]);
}
