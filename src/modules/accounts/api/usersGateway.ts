import { apiClient } from "../../../shared/api";
import type { UserAccount } from "../model/account.types";

export interface UserProfile extends UserAccount {
  themePreference?: "light" | "dark";
  failedLoginAttempts?: number;
  lockedUntil?: string;
  lockoutLevel?: number;
}

export type UserMutationPayload = Partial<
  Pick<
    UserProfile,
    | "username"
    | "email"
    | "firstName"
    | "lastName"
    | "pin"
    | "password"
    | "role"
    | "isActive"
    | "workDays"
    | "themePreference"
  >
>;

export interface UserDirectoryGateway {
  list(): Promise<UserProfile[]>;
}

export interface UserAdministrationGateway {
  create(payload: UserMutationPayload): Promise<UserProfile>;
  update(id: string, payload: UserMutationPayload): Promise<UserProfile>;
  delete(id: string): Promise<void>;
  unlock(id: string): Promise<void>;
}

export interface UserProfileGateway {
  findByUsername(username: string): Promise<UserProfile>;
  update(id: string, payload: UserMutationPayload): Promise<UserProfile>;
}

export interface UserScheduleGateway {
  addExtraDay(id: string, date: string, notes?: string): Promise<void>;
  removeExtraDay(id: string, date: string): Promise<void>;
}

type UsersHttpAdapter = UserDirectoryGateway &
  UserAdministrationGateway &
  UserProfileGateway &
  UserScheduleGateway;

export const usersGateway: UsersHttpAdapter = {
  list: () => apiClient("/users"),
  findByUsername: (username) =>
    apiClient(`/users/username/${encodeURIComponent(username)}`),

  create: (payload) =>
    apiClient("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    apiClient(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  async delete(id) {
    await apiClient(`/users/${id}`, { method: "DELETE" });
  },

  async unlock(id) {
    await apiClient(`/users/${id}/unlock`, { method: "POST" });
  },

  async addExtraDay(id, date, notes) {
    await apiClient(`/users/${id}/extra-days`, {
      method: "POST",
      body: JSON.stringify({ date, notes }),
    });
  },

  async removeExtraDay(id, date) {
    await apiClient(`/users/${id}/extra-days/${encodeURIComponent(date)}`, {
      method: "DELETE",
    });
  },
};
