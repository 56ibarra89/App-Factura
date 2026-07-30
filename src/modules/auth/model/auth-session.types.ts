import type { UserRole } from "./user.types";

export interface AuthenticatedUser {
  username: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthSessionState {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
  email: string;
  firstName: string;
  lastName: string;
}

export const EMPTY_AUTH_SESSION: AuthSessionState = {
  isLoggedIn: false,
  username: "",
  role: null,
  email: "",
  firstName: "",
  lastName: "",
};
