import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  element: JSX.Element;
}

/**
 * Guardia de ruta genérica.
 * Verifica que el usuario esté autenticado. Si no, redirige al login.
 */
const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;
