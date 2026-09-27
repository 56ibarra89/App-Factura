import { useCallback, useEffect } from "react";
import { logService } from "../../audit";
import { UserRole } from "../model/user.types";
import type { AuthSessionGateway } from "../api/authSessionGateway";
import { authSessionGateway } from "../api/authSessionGateway";
import type { LogoutResult } from "../model/auth-service.types";

// Tiempo límite de inactividad: 30 minutos
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 30_000;
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

    // Los cocineros y la pantalla KDS de preparación operan de forma continua
    // en cocina sin interacción constante de ratón/teclado, por lo que se eximen del auto-logout.
    const isKitchenDisplay = role === "cocinero" || window.location.hash.includes("kds");
    if (isKitchenDisplay) return;

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
      window.addEventListener(event, handleActivity, { passive: true })
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
