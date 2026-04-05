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
import Reportes from "../pages/Reportes";
import Administracion from "../pages/Administracion";
import CerrarCajaPage from "../pages/CerrarCajaPage";
import ConsultarTurnos from "../pages/ConsultarTurnos";
import MiCuenta from "../pages/MiCuenta";
import Cuentas from "../pages/Cuentas";
import { CajaProvider } from "../context/CajaContext";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <CajaProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login-pin" element={<LoginPin />} />
      <Route path="/home" element={<PrivateRoute element={<Home />} />} />
      <Route path="/producto" element={<PrivateRoute element={<Producto />} />} />
      <Route path="/facturacion" element={<PrivateRoute element={<Facturacion />} />} />
      <Route path="/clave" element={<PrivateRoute element={<ChangePassword />} />} />
      <Route path="/abrircaja" element={<PrivateRoute element={<AbrirCajaPage />} />} />
      <Route path="/cerrarcaja" element={<PrivateRoute element={<CerrarCajaPage />} />} />
      <Route path="/consultar-turnos" element={<PrivateRoute element={<ConsultarTurnos />} />} />
      <Route path="/mesas" element={<PrivateRoute element={<Mesa />} />} />
      <Route path="/ordenes" element={<PrivateRoute element={<Ordenes />} />} />
      <Route path="/anular-factura" element={<PrivateRoute element={<AnularFactura />} />} />
      <Route path="/consultar-factura" element={<PrivateRoute element={<ConsultarFacturas />} />} />
      <Route path="/reporte" element={<PrivateRoute element={<Reportes />} />} />
      <Route path="/admin" element={<PrivateRoute element={<Administracion />} />} />
      <Route path="/perfil" element={<PrivateRoute element={<MiCuenta />} />} />
      <Route path="/cuentas" element={<PrivateRoute element={<Cuentas />} />} />
    </Routes>
  </CajaProvider>
);

export default AppRoutes;
