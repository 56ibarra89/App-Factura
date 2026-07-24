import type { ReactNode } from "react";
import { useAuthOperations } from "../hooks/auth/useAuthOperations";
import { useAuthSession } from "../hooks/auth/useAuthSession";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { useLoginLockout } from "../hooks/useLoginLockout";
import { usePinLockout } from "../hooks/usePinLockout";
import type { AuthPreferencesGateway } from "../services/auth/authPreferencesGateway";
import { authPreferencesGateway as defaultPreferencesGateway } from "../services/auth/authPreferencesGateway";
import type { AuthSessionGateway } from "../services/auth/authSessionGateway";
import { authSessionGateway as defaultSessionGateway } from "../services/auth/authSessionGateway";
import type { SecureTokenGateway } from "../services/auth/secureTokenGateway";
import { secureTokenGateway as defaultTokenGateway } from "../services/auth/secureTokenGateway";
import { authService as defaultAuthService } from "../services/authService";
import type { IAuthService } from "../types/authService";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
  service?: IAuthService;
  sessionGateway?: AuthSessionGateway;
  tokenGateway?: SecureTokenGateway;
  preferencesGateway?: AuthPreferencesGateway;
}

export const AuthProvider = ({
  children,
  service = defaultAuthService,
  sessionGateway = defaultSessionGateway,
  tokenGateway = defaultTokenGateway,
  preferencesGateway = defaultPreferencesGateway,
}: AuthProviderProps) => {
  const session = useAuthSession(sessionGateway);
  const pinLockout = usePinLockout();
  const loginLockout = useLoginLockout();
  const authentication = useAuthOperations({
    service,
    session,
    pinLockout,
    loginLockout,
    tokenGateway,
    preferencesGateway,
  });

  useInactivityTimer(
    {
      isLoggedIn: session.state.isLoggedIn,
      username: session.state.username,
      role: session.state.role,
      onExpire: authentication.logout,
    },
    sessionGateway,
  );

  return (
    <AuthContext.Provider
      value={{
        ...session.state,
        loading: authentication.loading,
        error: authentication.error,
        login: authentication.login,
        loginWithPin: authentication.loginWithPin,
        logout: authentication.logout,
        clearError: authentication.clearError,
        validatePinForAction:
          authentication.validatePinForAction,
        updateUsername: session.updateUsername,
        lockoutTime: pinLockout.lockoutTime,
        loginLockoutTime:
          loginLockout.loginLockoutTime,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
