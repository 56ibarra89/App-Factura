import { useCallback, useEffect } from "react";
import { logService } from "../../audit";
import { UserRole } from "../model/user.types";
import type { AuthSessionGateway } from "../api/authSessionGateway";
import { authSessionGateway } from "../api/authSessionGateway";
import type { LogoutResult } from "../model/auth-service.types";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const CHECK_INTERVAL_MS = 30_000;
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
  onExpire: () => Promise<LogoutResult>;
}

export function useInactivityTimer({
  isLoggedIn,
  username,
  role,
  onExpire,
}: UseInactivityTimerOptions,
gateway: AuthSessionGateway = authSessionGateway): void {
  const resetTimer = useCallback(() => {
    if (!isLoggedIn) return;
    gateway.touch();
  }, [gateway, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkInactivity = () => {
      const last = gateway.getLastActivity() ?? Date.now();
      if (Date.now() - last > INACTIVITY_LIMIT_MS) {
        void onExpire().then((result) => {
          if (result.success) {
            logService.log(
              username,
              role,
              "SESSION_EXPIRED",
              "Cierre de sesión automático por inactividad"
            );
          } else {
            gateway.touch();
          }
        });
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
  }, [
    gateway,
    isLoggedIn,
    username,
    role,
    onExpire,
    resetTimer,
  ]);
}

