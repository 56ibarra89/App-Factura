import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "../../modules/auth";

interface PrivateRouteProps {
  element: JSX.Element;
  allowMotorizado?: boolean;
  allowedRoles?: UserRole[];
}

const PrivateRoute = ({
  element,
  allowMotorizado = false,
  allowedRoles,
}: PrivateRouteProps) => {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (role === "motorizado" && !allowMotorizado) {
    return <Navigate to="/home" replace />;
  }
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }
  return element;
};

export default PrivateRoute;

