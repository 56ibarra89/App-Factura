import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import Login from "../../modules/auth/pages/LoginPage";
import { CajaProvider } from "../../modules/cash-register";

const Home = lazy(() => import("../pages/HomePage"));
const Facturacion = lazy(
  () => import("../../modules/checkout/pages/CheckoutPage")
);
const DeliveryPage = lazy(
  () => import("../../modules/delivery/pages/DeliveryPage")
);
const MisEntregas = lazy(
  () => import("../../modules/delivery/pages/DriverDeliveriesPage")
);
const Producto = lazy(
  () => import("../../modules/catalog/pages/ProductsPage")
);
const ForgotPassword = lazy(
  () => import("../../modules/auth/pages/ForgotPasswordPage")
);
const ResetPassword = lazy(() =>
  import("../../modules/auth/pages/ResetPasswordPage").then((module) => ({
    default: module.ResetPassword,
  }))
);
const LoginPin = lazy(
  () => import("../../modules/auth/pages/LoginPinPage")
);
const AbrirCajaPage = lazy(
  () => import("../../modules/cash-register/pages/OpenCashRegisterPage")
);
const Mesa = lazy(
  () => import("../../modules/tables/pages/TablesPage")
);
const Ordenes = lazy(
  () => import("../pages/OrdersRoutePage")
);
const KdsPage = lazy(
  () => import("../../modules/orders/pages/KdsPage")
);
const AnularFactura = lazy(
  () => import("../../modules/invoices/pages/CancelInvoicePage")
);
const ConsultarFacturas = lazy(
  () => import("../../modules/invoices/pages/InvoicesPage")
);
const Reportes = lazy(
  () => import("../../modules/reports/pages/SalesReportsPage")
);
const Administracion = lazy(
  () => import("../pages/AdminDashboardPage")
);
const CerrarCajaPage = lazy(
  () => import("../../modules/cash-register/pages/CloseCashRegisterPage")
);
const ConsultarTurnos = lazy(
  () => import("../../modules/cash-register/pages/ShiftHistoryPage")
);
const MiCuenta = lazy(() => import("../../modules/accounts/pages/MyAccountPage"));
const Cuentas = lazy(() => import("../../modules/accounts/pages/AccountsPage"));
const ConfigurarMesas = lazy(
  () => import("../../modules/tables/pages/TableConfigurationPage")
);
const AdminCajas = lazy(
  () => import("../../modules/cash-register/pages/AdminCashRegistersPage")
);
const AdminImpuestos = lazy(
  () => import("../../modules/settings/pages/TaxSettingsPage")
);
const AdminConfiguracion = lazy(
  () => import("../../modules/settings/pages/GeneralSettingsPage")
);
const AdminEmpresa = lazy(
  () => import("../../modules/settings/pages/CompanySettingsPage")
);
const Bitacora = lazy(
  () => import("../pages/AuditLogRoutePage")
);
const Perifericos = lazy(
  () => import("../../modules/devices/pages/DevicesPage")
);
const AdminPromociones = lazy(
  () => import("../../modules/promotions/pages/AdminPromotionsPage")
);
const AdminCorrelativos = lazy(
  () => import("../../modules/fiscal/pages/FiscalSequencesPage")
);
const AdminRespaldos = lazy(
  () => import("../../modules/backups/pages/BackupsPage")
);
const AdminClientes = lazy(
  () => import("../../modules/customers/pages/AdminCustomersPage")
);
const AdminHorarios = lazy(
  () => import("../../modules/accounts/pages/EmployeeSchedulesPage")
);
const AdminZonasMeseros = lazy(
  () => import("../../modules/tables/pages/WaiterZonesPage")
);
const AdminCocinas = lazy(
  () => import("../../modules/kitchens/pages/AdminKitchensPage")
);

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
        {}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login-pin" element={<LoginPin />} />

        {}
        <Route
          path="/home"
          element={<PrivateRoute element={<Home />} allowMotorizado />}
        />
        <Route
          path="/producto"
          element={
            <PrivateRoute element={<Producto />} allowedRoles={["admin"]} />
          }
        />
        <Route
          path="/facturacion"
          element={
            <PrivateRoute
              element={<Facturacion />}
              allowedRoles={["admin", "cajero", "cajero_principal", "mesero"]}
            />
          }
        />
        <Route
          path="/delivery"
          element={
            <PrivateRoute
              element={<DeliveryPage />}
              allowedRoles={["admin", "despachador"]}
            />
          }
        />
        <Route
          path="/mis-entregas"
          element={
            <PrivateRoute
              element={<MisEntregas />}
              allowMotorizado
              allowedRoles={["admin", "despachador", "motorizado"]}
            />
          }
        />
        <Route
          path="/abrircaja"
          element={
            <PrivateRoute
              element={<AbrirCajaPage />}
              allowedRoles={["admin", "cajero_principal"]}
            />
          }
        />
        <Route
          path="/cerrarcaja"
          element={
            <PrivateRoute
              element={<CerrarCajaPage />}
              allowedRoles={["admin", "cajero_principal"]}
            />
          }
        />
        <Route
          path="/consultar-turnos"
          element={
            <PrivateRoute
              element={<ConsultarTurnos />}
              allowedRoles={["admin", "cajero_principal"]}
            />
          }
        />
        <Route
          path="/mesas"
          element={
            <PrivateRoute
              element={<Mesa />}
              allowedRoles={["admin", "mesero"]}
            />
          }
        />
        <Route
          path="/ordenes"
          element={
            <PrivateRoute
              element={<Ordenes />}
              allowedRoles={["admin", "cocinero"]}
            />
          }
        />
        <Route
          path="/kds"
          element={
            <PrivateRoute
              element={<KdsPage />}
              allowedRoles={["admin", "cocinero"]}
            />
          }
        />
        <Route
          path="/anular-factura"
          element={
            <PrivateRoute
              element={<AnularFactura />}
              allowedRoles={["admin", "cajero", "cajero_principal"]}
            />
          }
        />
        <Route
          path="/consultar-factura"
          element={
            <PrivateRoute
              element={<ConsultarFacturas />}
              allowedRoles={["admin", "cajero", "cajero_principal"]}
            />
          }
        />
        <Route
          path="/reporte"
          element={
            <PrivateRoute element={<Reportes />} allowedRoles={["admin"]} />
          }
        />
        <Route
          path="/perfil"
          element={<PrivateRoute element={<MiCuenta />} allowMotorizado />}
        />

        {}
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

