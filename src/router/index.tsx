import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import Home from "../pages/Home";
import Facturacion from "../pages/Facturacion";
import Producto from "../pages/Producto";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
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
import ConfigurarMesas from "../pages/admin/ConfigurarMesas";
import AdminCajas from "../pages/admin/AdminCajas";
import AdminImpuestos from "../pages/admin/AdminImpuestos";
import AdminConfiguracion from "../pages/admin/AdminConfiguracion";
import AdminEmpresa from "../pages/admin/AdminEmpresa";
import Bitacora from "../pages/admin/Bitacora";
import { CajaProvider } from "../context/CajaContext";
import Perifericos from "../pages/admin/AdminPerifericos";
import AdminPromociones from "../pages/admin/AdminPromociones";

const AppRoutes = () => (
  <CajaProvider>
    <Routes>
      {/* ── Rutas Públicas ── */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/login-pin" element={<LoginPin />} />

      {/* ── Rutas Privadas (cualquier usuario autenticado) ── */}
      <Route path="/home" element={<PrivateRoute element={<Home />} />} />
      <Route
        path="/producto"
        element={<PrivateRoute element={<Producto />} />}
      />
      <Route
        path="/facturacion"
        element={<PrivateRoute element={<Facturacion />} />}
      />

      <Route
        path="/abrircaja"
        element={<PrivateRoute element={<AbrirCajaPage />} />}
      />
      <Route
        path="/cerrarcaja"
        element={<PrivateRoute element={<CerrarCajaPage />} />}
      />
      <Route
        path="/consultar-turnos"
        element={<PrivateRoute element={<ConsultarTurnos />} />}
      />
      <Route path="/mesas" element={<PrivateRoute element={<Mesa />} />} />
      <Route path="/ordenes" element={<PrivateRoute element={<Ordenes />} />} />
      <Route
        path="/anular-factura"
        element={<PrivateRoute element={<AnularFactura />} />}
      />
      <Route
        path="/consultar-factura"
        element={<PrivateRoute element={<ConsultarFacturas />} />}
      />
      <Route
        path="/reporte"
        element={<PrivateRoute element={<Reportes />} />}
      />
      <Route path="/perfil" element={<PrivateRoute element={<MiCuenta />} />} />

      {/* ── Rutas de Administración (solo rol 'admin') ── */}
      <Route
        path="/admin"
        element={<AdminRoute element={<Administracion />} />}
      />
      <Route
        path="/admin/cuentas"
        element={<AdminRoute element={<Cuentas />} />}
      />
      <Route
        path="/admin/mesas"
        element={<AdminRoute element={<ConfigurarMesas />} />}
      />
      <Route
        path="/admin/cajas"
        element={<AdminRoute element={<AdminCajas />} />}
      />
      <Route
        path="/admin/impuestos"
        element={<AdminRoute element={<AdminImpuestos />} />}
      />
      <Route
        path="/admin/configuracion"
        element={<AdminRoute element={<AdminConfiguracion />} />}
      />
      <Route
        path="/admin/empresa"
        element={<AdminRoute element={<AdminEmpresa />} />}
      />
      <Route
        path="/admin/bitacora"
        element={<AdminRoute element={<Bitacora />} />}
      />
      <Route
        path="/admin/perifericos"
        element={<AdminRoute element={<Perifericos />} />}
      />
      <Route
        path="/admin/promociones"
        element={<AdminRoute element={<AdminPromociones />} />}
      />
    </Routes>
  </CajaProvider>
);

export default AppRoutes;
