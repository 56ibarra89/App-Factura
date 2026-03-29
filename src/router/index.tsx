import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Facturacion from "../pages/Facturacion";
import Producto from "../pages/Producto";
import ChangePassword from "../pages/ChangePassword";
import Login from "../pages/Login";
import LoginPin from "../pages/LoginPin";
import AbrirCajaPage from "../pages/AbrirCajaPage";
import Mesa from "../pages/Mesa";
import Ordenes from "../pages/Ordenes";
import AnularFactura from "../pages/AnularFactura";
import ConsultarFacturas from "../pages/ConsultarFacturas";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login-pin" element={<LoginPin />} />
    <Route path="/home" element={<PrivateRoute element={<Home />} />} />
    <Route path="/producto" element={<PrivateRoute element={<Producto />} />} />
    <Route path="/facturacion" element={<PrivateRoute element={<Facturacion />} />} />
    <Route path="/clave" element={<PrivateRoute element={<ChangePassword />} />} />
    <Route path="/abrircaja" element={<PrivateRoute element={<AbrirCajaPage />} />} />
    <Route path="/mesas" element={<PrivateRoute element={<Mesa />} />} />
    <Route path="/ordenes" element={<PrivateRoute element={<Ordenes />} />} />
    <Route path="/anular-factura" element={<PrivateRoute element={<AnularFactura />} />} />
    <Route path="/consultar-factura" element={<PrivateRoute element={<ConsultarFacturas />} />} />
  </Routes>
);

export default AppRoutes;
