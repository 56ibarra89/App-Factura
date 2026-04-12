import { UserRole } from "./user";

export interface AuthLoginResult {
  success: boolean;
  role?: UserRole;
}

export interface IAuthService {
  login(username: string, password: string): Promise<AuthLoginResult>;
  loginWithPin(pin: string): Promise<{ username: string; role: UserRole } | null>;
}
