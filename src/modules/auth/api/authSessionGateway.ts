import type {
  AuthenticatedUser,
  AuthSessionState,
} from "../model/auth-session.types";
import { EMPTY_AUTH_SESSION } from "../model/auth-session.types";
import type { IKeyValueStorage } from "../../../shared/storage";
import type { UserRole } from "../model/user.types";
import type { PermissionCode } from "../model/permission.types";
import { localStore } from "../../../shared/storage";

export const SESSION_KEYS = {
  loggedIn: "loggedIn",
  username: "username",
  role: "role",
  email: "email",
  firstName: "firstName",
  lastName: "lastName",
  lastActivity: "lastActivity",
  accessRoleId: "accessRoleId",
  accessRoleName: "accessRoleName",
  permissions: "permissions",
} as const;

export interface AuthSessionGateway {
  load(): AuthSessionState;
  save(user: AuthenticatedUser): void;
  updateUsername(username: string): void;
  updateAuthorization(authorization: {
    accessRoleId?: string;
    accessRoleName?: string;
    permissions: PermissionCode[];
  }): void;
  clear(): void;
  getLastActivity(): number | null;
  touch(): void;
}

export function createAuthSessionGateway(
  storage: IKeyValueStorage = localStore,
): AuthSessionGateway {
  return {
    load() {
      if (storage.getItem(SESSION_KEYS.loggedIn) !== "true") {
        return EMPTY_AUTH_SESSION;
      }

      let permissions: PermissionCode[] = [];
      try {
        const stored = JSON.parse(
          storage.getItem(SESSION_KEYS.permissions) || "[]",
        );
        if (Array.isArray(stored)) permissions = stored;
      } catch {
        permissions = [];
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
        accessRoleId:
          storage.getItem(SESSION_KEYS.accessRoleId) || undefined,
        accessRoleName:
          storage.getItem(SESSION_KEYS.accessRoleName) || undefined,
        permissions,
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
      if (user.accessRoleId) {
        storage.setItem(SESSION_KEYS.accessRoleId, user.accessRoleId);
      }
      if (user.accessRoleName) {
        storage.setItem(SESSION_KEYS.accessRoleName, user.accessRoleName);
      }
      storage.setItem(
        SESSION_KEYS.permissions,
        JSON.stringify(user.permissions),
      );
      storage.setItem(
        SESSION_KEYS.lastActivity,
        Date.now().toString(),
      );
    },

    updateUsername(username) {
      storage.setItem(SESSION_KEYS.username, username);
    },

    updateAuthorization(authorization) {
      if (authorization.accessRoleId) {
        storage.setItem(SESSION_KEYS.accessRoleId, authorization.accessRoleId);
      } else {
        storage.removeItem(SESSION_KEYS.accessRoleId);
      }
      if (authorization.accessRoleName) {
        storage.setItem(SESSION_KEYS.accessRoleName, authorization.accessRoleName);
      } else {
        storage.removeItem(SESSION_KEYS.accessRoleName);
      }
      storage.setItem(
        SESSION_KEYS.permissions,
        JSON.stringify(authorization.permissions),
      );
    },

    clear() {
      Object.values(SESSION_KEYS).forEach((key) => {
        storage.removeItem(key);
      });
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
