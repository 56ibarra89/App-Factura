import type {
  AuthenticatedUser,
  AuthSessionState,
} from "../../types/auth-session";
import { EMPTY_AUTH_SESSION } from "../../types/auth-session";
import type { IKeyValueStorage } from "../../types/storage.types";
import type { UserRole } from "../../types/user";
import { sessionStore } from "../storage/storage";

const SESSION_KEYS = {
  loggedIn: "loggedIn",
  username: "username",
  role: "role",
  email: "email",
  firstName: "firstName",
  lastName: "lastName",
  lastActivity: "lastActivity",
} as const;

export interface AuthSessionGateway {
  load(): AuthSessionState;
  save(user: AuthenticatedUser): void;
  updateUsername(username: string): void;
  clear(): void;
  getLastActivity(): number | null;
  touch(): void;
}

export function createAuthSessionGateway(
  storage: IKeyValueStorage = sessionStore,
): AuthSessionGateway {
  return {
    load() {
      if (storage.getItem(SESSION_KEYS.loggedIn) !== "true") {
        return EMPTY_AUTH_SESSION;
      }

      return {
        isLoggedIn: true,
        username:
          storage.getItem(SESSION_KEYS.username) || "",
        role: storage.getItem(
          SESSION_KEYS.role,
        ) as UserRole | null,
        email: storage.getItem(SESSION_KEYS.email) || "",
        firstName:
          storage.getItem(SESSION_KEYS.firstName) || "",
        lastName:
          storage.getItem(SESSION_KEYS.lastName) || "",
      };
    },

    save(user) {
      storage.setItem(SESSION_KEYS.loggedIn, "true");
      storage.setItem(SESSION_KEYS.username, user.username);
      storage.setItem(SESSION_KEYS.role, user.role);
      storage.setItem(SESSION_KEYS.email, user.email);
      storage.setItem(
        SESSION_KEYS.firstName,
        user.firstName,
      );
      storage.setItem(SESSION_KEYS.lastName, user.lastName);
      storage.setItem(
        SESSION_KEYS.lastActivity,
        Date.now().toString(),
      );
    },

    updateUsername(username) {
      storage.setItem(SESSION_KEYS.username, username);
    },

    clear() {
      storage.clear();
    },

    getLastActivity() {
      const value = Number(
        storage.getItem(SESSION_KEYS.lastActivity),
      );
      return Number.isFinite(value) && value > 0
        ? value
        : null;
    },

    touch() {
      storage.setItem(
        SESSION_KEYS.lastActivity,
        Date.now().toString(),
      );
    },
  };
}

export const authSessionGateway =
  createAuthSessionGateway();
