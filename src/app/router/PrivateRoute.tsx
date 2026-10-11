import { Navigate } from "react-router-dom";
import {
  useAuth,
  type PermissionCode,
  type UserRole,
} from "../../modules/auth";

interface PrivateRouteProps {
  element: JSX.Element;
  allowMotorizado?: boolean;
  allowedRoles?: UserRole[];
  requiredPermissions?: PermissionCode[];
}

const PrivateRoute = ({
  element,
  allowMotorizado = false,
  allowedRoles,
  requiredPermissions,
}: PrivateRouteProps) => {
  const { isLoggedIn, role, hasPermission } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (
    role === "motorizado" &&
    !allowMotorizado &&
    !requiredPermissions?.length
  ) {
    return <Navigate to="/home" replace />;
  }
  if (
    requiredPermissions?.length &&
    !hasPermission(...requiredPermissions)
  ) {
    return <Navigate to="/home" replace />;
  }
  if (
    !requiredPermissions?.length &&
    allowedRoles &&
    role &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/home" replace />;
  }
  return element;
};

export default PrivateRoute;

