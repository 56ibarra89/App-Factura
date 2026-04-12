import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
  element: JSX.Element;
}

const AdminRoute = ({ element }: AdminRouteProps) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (role !== "admin") return <Navigate to="/home" replace />;

  return element;
};

export default AdminRoute;
