import { useCallback, useEffect, useState } from "react";
import type {
  AuthenticatedUser,
  AuthSessionState,
} from "../model/auth-session.types";
import { EMPTY_AUTH_SESSION } from "../model/auth-session.types";
import type { AuthSessionGateway } from "../api/authSessionGateway";
import { authSessionGateway, SESSION_KEYS } from "../api/authSessionGateway";

export interface AuthSessionController {
  state: AuthSessionState;
  signIn(user: AuthenticatedUser): void;
  signOut(): void;
  updateUsername(username: string): void;
}

export function useAuthSession(
  gateway: AuthSessionGateway = authSessionGateway,
): AuthSessionController {
  const [state, setState] = useState<AuthSessionState>(
    gateway.load,
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === SESSION_KEYS.loggedIn ||
        event.key === SESSION_KEYS.username ||
        event.key === SESSION_KEYS.role ||
        event.key === "access_token"
      ) {
        setState(gateway.load());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [gateway]);

  const signIn = useCallback(
    (user: AuthenticatedUser) => {
      gateway.save(user);
      setState({
        isLoggedIn: true,
        ...user,
      });
    },
    [gateway],
  );

  const signOut = useCallback(() => {
    gateway.clear();
    setState(EMPTY_AUTH_SESSION);
  }, [gateway]);

  const updateUsername = useCallback(
    (username: string) => {
      gateway.updateUsername(username);
      setState((current) => ({
        ...current,
        username,
      }));
    },
    [gateway],
  );

  return {
    state,
    signIn,
    signOut,
    updateUsername,
  };
}
