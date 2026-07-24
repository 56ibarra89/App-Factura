import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import Login from "../pages/Login";
import { CajaProvider } from "../context/CajaProvider";

const Home = lazy(() => import("../pages/Home"));
const Facturacion = lazy(() => import("../pages/Facturacion"));
const DeliveryPage = lazy(() => import("../pages/DeliveryPage"));
const Producto = lazy(() => import("../pages/Producto"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() =>
  import("../pages/ResetPassword").then((module) => ({
    default: module.ResetPassword,
  })),
);
const LoginPin = lazy(() => import("../pages/LoginPin"));
const AbrirCajaPage = lazy(() => import("../pages/AbrirCajaPage"));
const Mesa = lazy(() => import("../pages/Mesa"));
const Ordenes = lazy(() => import("../pages/Ordenes"));
const AnularFactura = lazy(() => import("../pages/AnularFactura"));
const ConsultarFacturas = lazy(() => import("../pages/ConsultarFacturas"));
const Reportes = lazy(() => import("../pages/Reportes"));
const Administracion = lazy(() => import("../pages/Administracion"));
const CerrarCajaPage = lazy(() => import("../pages/CerrarCajaPage"));
const ConsultarTurnos = lazy(() => import("../pages/ConsultarTurnos"));
const MiCuenta = lazy(() => import("../pages/MiCuenta"));
const Cuentas = lazy(() => import("../pages/Cuentas"));
const ConfigurarMesas = lazy(
  () => import("../pages/admin/ConfigurarMesas"),
);
const AdminCajas = lazy(() => import("../pages/admin/AdminCajas"));
const AdminImpuestos = lazy(() => import("../pages/admin/AdminImpuestos"));
const AdminConfiguracion = lazy(
  () => import("../pages/admin/AdminConfiguracion"),
);
const AdminEmpresa = lazy(() => import("../pages/admin/AdminEmpresa"));
const Bitacora = lazy(() => import("../pages/admin/Bitacora"));
const Perifericos = lazy(() => import("../pages/admin/AdminPerifericos"));
const AdminPromociones = lazy(
  () => import("../pages/admin/AdminPromociones"),
);
const AdminCorrelativos = lazy(
  () => import("../pages/admin/AdminCorrelativos"),
);
const AdminRespaldos = lazy(() => import("../pages/admin/AdminRespaldos"));
const AdminClientes = lazy(() => import("../pages/admin/AdminClientes"));
const AdminHorarios = lazy(() => import("../pages/admin/AdminHorarios"));
const AdminZonasMeseros = lazy(
  () => import("../pages/admin/AdminZonasMeseros"),
);
const AdminCocinas = lazy(() => import("../pages/admin/AdminCocinas"));

const RouteFallback = () => (
  <Box
    role="status"
    aria-label="Cargando pantalla"
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
  >
    <CircularProgress color="error" />
  </Box>
);

const AppRoutes = () => (
  <CajaProvider>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
      {/* ── Rutas Públicas ── */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
        path="/delivery"
        element={<PrivateRoute element={<DeliveryPage />} />}
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
        path="/admin/horarios"
        element={<AdminRoute element={<AdminHorarios />} />}
      />
      <Route
        path="/admin/zonas-meseros"
        element={<AdminRoute element={<AdminZonasMeseros />} />}
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
        path="/admin/cocinas"
        element={<AdminRoute element={<AdminCocinas />} />}
      />
      <Route
        path="/admin/perifericos"
        element={<AdminRoute element={<Perifericos />} />}
      />
      <Route
        path="/admin/promociones"
        element={<AdminRoute element={<AdminPromociones />} />}
      />
      <Route
        path="/admin/correlativos"
        element={<AdminRoute element={<AdminCorrelativos />} />}
      />
      <Route
        path="/admin/respaldos"
        element={<AdminRoute element={<AdminRespaldos />} />}
      />
      <Route
        path="/admin/clientes"
        element={<AdminRoute element={<AdminClientes />} />}
      />
      </Routes>
    </Suspense>
  </CajaProvider>
);

export default AppRoutes;
