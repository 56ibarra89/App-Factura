export interface IAuthService {
  login(username: string, password: string): Promise<boolean>;
  loginWithPin(pin: string): Promise<string | null>;
}
