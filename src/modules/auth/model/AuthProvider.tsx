import type { ReactNode } from "react";
import { useAuthOperations } from "../hooks/useAuthOperations";
import { useAuthSession } from "../hooks/useAuthSession";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { useLoginLockout } from "../hooks/useLoginLockout";
import { usePinLockout } from "../hooks/usePinLockout";
import type { AuthPreferencesGateway } from "../api/authPreferencesGateway";
import { authPreferencesGateway as defaultPreferencesGateway } from "../api/authPreferencesGateway";
import type { AuthSessionGateway } from "../api/authSessionGateway";
import { authSessionGateway as defaultSessionGateway } from "../api/authSessionGateway";
import type { SecureTokenGateway } from "../api/secureTokenGateway";
import { secureTokenGateway as defaultTokenGateway } from "../api/secureTokenGateway";
import { authService as defaultAuthService } from "../api/authService";
import type { IAuthService } from "./auth-service.types";
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
