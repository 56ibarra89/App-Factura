import { Navigate } from "react-router-dom";
import { useAuth, type PermissionCode } from "../../modules/auth";

interface AdminRouteProps {
  element: JSX.Element;
  requiredPermissions: PermissionCode[];
  matchAny?: boolean;
}

const AdminRoute = ({
  element,
  requiredPermissions,
  matchAny = false,
}: AdminRouteProps) => {
  const { isLoggedIn, hasPermission } = useAuth();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  const allowed = matchAny
    ? requiredPermissions.some((permission) => hasPermission(permission))
    : hasPermission(...requiredPermissions);
  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return element;
};

export default AdminRoute;
