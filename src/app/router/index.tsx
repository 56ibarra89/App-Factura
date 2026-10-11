import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import Login from "../../modules/auth/pages/LoginPage";
import { CajaProvider } from "../../modules/cash-register";
import { PERMISSIONS } from "../../modules/auth";
import { ADMIN_PANEL_PERMISSIONS } from "../navigation/adminModules";

const Home = lazy(() => import("../pages/HomePage"));
const Facturacion = lazy(
  () => import("../../modules/checkout/pages/CheckoutPage"),
);
const DeliveryPage = lazy(
  () => import("../../modules/delivery/pages/DeliveryPage"),
);
const MisEntregas = lazy(
  () => import("../../modules/delivery/pages/DriverDeliveriesPage"),
);
const Producto = lazy(() => import("../../modules/catalog/pages/ProductsPage"));
const ForgotPassword = lazy(
  () => import("../../modules/auth/pages/ForgotPasswordPage"),
);
const ResetPassword = lazy(() =>
  import("../../modules/auth/pages/ResetPasswordPage").then((module) => ({
    default: module.ResetPassword,
  })),
);
const LoginPin = lazy(() => import("../../modules/auth/pages/LoginPinPage"));
const AbrirCajaPage = lazy(
  () => import("../../modules/cash-register/pages/OpenCashRegisterPage"),
);
const Mesa = lazy(() => import("../../modules/tables/pages/TablesPage"));
const Ordenes = lazy(() => import("../pages/OrdersRoutePage"));
const KdsPage = lazy(() => import("../../modules/orders/pages/KdsPage"));
const AnularFactura = lazy(
  () => import("../../modules/invoices/pages/CancelInvoicePage"),
);
const ConsultarFacturas = lazy(
  () => import("../../modules/invoices/pages/InvoicesPage"),
);
const Reportes = lazy(
  () => import("../../modules/reports/pages/SalesReportsPage"),
);
const Administracion = lazy(() => import("../pages/AdminDashboardPage"));
const CerrarCajaPage = lazy(
  () => import("../../modules/cash-register/pages/CloseCashRegisterPage"),
);
const ConsultarTurnos = lazy(
  () => import("../../modules/cash-register/pages/ShiftHistoryPage"),
);
const CashExpensesPage = lazy(
  () => import("../../modules/cash-register/pages/CashExpensesPage"),
);
const MiCuenta = lazy(
  () => import("../../modules/accounts/pages/MyAccountPage"),
);
const Cuentas = lazy(() => import("../../modules/accounts/pages/AccountsPage"));
const ConfigurarMesas = lazy(
  () => import("../../modules/tables/pages/TableConfigurationPage"),
);
const AdminCajas = lazy(
  () => import("../../modules/cash-register/pages/AdminCashRegistersPage"),
);
const AdminImpuestos = lazy(
  () => import("../../modules/settings/pages/TaxSettingsPage"),
);
const AdminConfiguracion = lazy(
  () => import("../../modules/settings/pages/GeneralSettingsPage"),
);
const AdminEmpresa = lazy(
  () => import("../../modules/settings/pages/CompanySettingsPage"),
);
const Bitacora = lazy(() => import("../pages/AuditLogRoutePage"));
const Perifericos = lazy(
  () => import("../../modules/devices/pages/DevicesPage"),
);
const AdminPromociones = lazy(
  () => import("../../modules/promotions/pages/AdminPromotionsPage"),
);
const AdminCorrelativos = lazy(
  () => import("../../modules/fiscal/pages/FiscalSequencesPage"),
);
const AdminRespaldos = lazy(
  () => import("../../modules/backups/pages/BackupsPage"),
);
const AdminClientes = lazy(
  () => import("../../modules/customers/pages/AdminCustomersPage"),
);
const AdminHorarios = lazy(
  () => import("../../modules/accounts/pages/EmployeeSchedulesPage"),
);
const AdminZonasMeseros = lazy(
  () => import("../../modules/tables/pages/WaiterZonesPage"),
);
const AdminCocinas = lazy(
  () => import("../../modules/kitchens/pages/AdminKitchensPage"),
);
const AdminPoliticasGastos = lazy(
  () => import("../../modules/cash-register/pages/PettyCashPolicyPage"),
);
const AdminTiemposServicio = lazy(
  () => import("../../modules/settings/pages/ServiceSlaSettingsPage"),
);
const AdminPoliticasAnulacion = lazy(
  () => import("../../modules/settings/pages/VoidWastePolicyPage"),
);
const AdminMetodosPago = lazy(
  () => import("../../modules/settings/pages/PaymentMethodsSettingsPage"),
);
const AdminModificadoresCocina = lazy(
  () => import("../../modules/settings/pages/KitchenModifiersSettingsPage"),
);
const RolesPermissionsPage = lazy(
  () => import("../../modules/access-control/pages/RolesPermissionsPage"),
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
            <PrivateRoute
              element={<Producto />}
              requiredPermissions={[PERMISSIONS.PRODUCTS_MANAGE]}
            />
          }
        />
        <Route
          path="/facturacion"
          element={
            <PrivateRoute
              element={<Facturacion />}
              allowedRoles={[
                "admin",
                "cajero",
                "cajero_principal",
                "mesero",
                "despachador",
              ]}
              requiredPermissions={[PERMISSIONS.BILLING_CREATE]}
            />
          }
        />
        <Route
          path="/delivery"
          element={
            <PrivateRoute
              element={<DeliveryPage />}
              allowedRoles={["admin", "despachador"]}
              requiredPermissions={[PERMISSIONS.DELIVERY_MANAGE]}
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
              requiredPermissions={[PERMISSIONS.DELIVERY_READ]}
            />
          }
        />
        <Route
          path="/abrircaja"
          element={
            <PrivateRoute
              element={<AbrirCajaPage />}
              allowedRoles={["admin", "cajero_principal"]}
              requiredPermissions={[PERMISSIONS.CASH_OPEN]}
            />
          }
        />
        <Route
          path="/cerrarcaja"
          element={
            <PrivateRoute
              element={<CerrarCajaPage />}
              allowedRoles={["admin", "cajero_principal"]}
              requiredPermissions={[PERMISSIONS.CASH_CLOSE]}
            />
          }
        />
        <Route
          path="/consultar-turnos"
          element={
            <PrivateRoute
              element={<ConsultarTurnos />}
              allowedRoles={["admin", "cajero_principal"]}
              requiredPermissions={[PERMISSIONS.CASH_READ]}
            />
          }
        />
        <Route
          path="/gastos-caja"
          element={
            <PrivateRoute
              element={<CashExpensesPage />}
              allowedRoles={["admin", "cajero", "cajero_principal"]}
              requiredPermissions={[PERMISSIONS.CASH_EXPENSES]}
            />
          }
        />
        <Route
          path="/mesas"
          element={
            <PrivateRoute
              element={<Mesa />}
              allowedRoles={["admin", "mesero"]}
              requiredPermissions={[PERMISSIONS.TABLES_READ]}
            />
          }
        />
        <Route
          path="/ordenes"
          element={
            <PrivateRoute
              element={<Ordenes />}
              allowedRoles={["admin", "cocinero"]}
              requiredPermissions={[PERMISSIONS.ORDERS_READ]}
            />
          }
        />
        <Route
          path="/kds"
          element={
            <PrivateRoute
              element={<KdsPage />}
              allowedRoles={["admin", "cocinero"]}
              requiredPermissions={[PERMISSIONS.KITCHEN_READ]}
            />
          }
        />
        <Route
          path="/anular-factura"
          element={
            <PrivateRoute
              element={<AnularFactura />}
              allowedRoles={["admin", "cajero", "cajero_principal"]}
              requiredPermissions={[PERMISSIONS.INVOICES_CANCEL]}
            />
          }
        />
        <Route
          path="/consultar-factura"
          element={
            <PrivateRoute
              element={<ConsultarFacturas />}
              allowedRoles={["admin", "cajero", "cajero_principal"]}
              requiredPermissions={[PERMISSIONS.INVOICES_READ]}
            />
          }
        />
        <Route
          path="/reporte"
          element={
            <PrivateRoute
              element={<Reportes />}
              requiredPermissions={[PERMISSIONS.REPORTS_READ]}
            />
          }
        />
        <Route
          path="/perfil"
          element={<PrivateRoute element={<MiCuenta />} allowMotorizado />}
        />

        {}
        <Route
          path="/admin"
          element={<AdminRoute element={<Administracion />} requiredPermissions={ADMIN_PANEL_PERMISSIONS} matchAny />}
        />
        <Route
          path="/admin/cuentas"
          element={<AdminRoute element={<Cuentas />} requiredPermissions={[PERMISSIONS.USERS_MANAGE]} />}
        />
        <Route
          path="/admin/roles-permisos"
          element={<AdminRoute element={<RolesPermissionsPage />} requiredPermissions={[PERMISSIONS.ROLES_READ]} />}
        />
        <Route
          path="/admin/horarios"
          element={<AdminRoute element={<AdminHorarios />} requiredPermissions={[PERMISSIONS.USERS_MANAGE]} />}
        />
        <Route
          path="/admin/zonas-meseros"
          element={<AdminRoute element={<AdminZonasMeseros />} requiredPermissions={[PERMISSIONS.TABLES_ASSIGN_ZONES]} />}
        />
        <Route
          path="/admin/mesas"
          element={<AdminRoute element={<ConfigurarMesas />} requiredPermissions={[PERMISSIONS.TABLES_CONFIGURE]} />}
        />
        <Route
          path="/admin/cajas"
          element={<AdminRoute element={<AdminCajas />} requiredPermissions={[PERMISSIONS.CASH_CONFIGURE]} />}
        />
        <Route
          path="/admin/politicas-gastos"
          element={<AdminRoute element={<AdminPoliticasGastos />} requiredPermissions={[PERMISSIONS.CASH_CONFIGURE]} />}
        />
        <Route
          path="/admin/tiempos-servicio"
          element={<AdminRoute element={<AdminTiemposServicio />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/politicas-anulacion"
          element={<AdminRoute element={<AdminPoliticasAnulacion />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/impuestos"
          element={<AdminRoute element={<AdminImpuestos />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/metodos-pago"
          element={<AdminRoute element={<AdminMetodosPago />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/modificadores-cocina"
          element={<AdminRoute element={<AdminModificadoresCocina />} requiredPermissions={[PERMISSIONS.KITCHEN_CONFIGURE]} />}
        />
        <Route
          path="/admin/configuracion"
          element={<AdminRoute element={<AdminConfiguracion />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/empresa"
          element={<AdminRoute element={<AdminEmpresa />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/bitacora"
          element={<AdminRoute element={<Bitacora />} requiredPermissions={[PERMISSIONS.AUDIT_READ]} />}
        />
        <Route
          path="/admin/cocinas"
          element={<AdminRoute element={<AdminCocinas />} requiredPermissions={[PERMISSIONS.KITCHEN_CONFIGURE]} />}
        />
        <Route
          path="/admin/perifericos"
          element={<AdminRoute element={<Perifericos />} requiredPermissions={[PERMISSIONS.DEVICES_MANAGE]} />}
        />
        <Route
          path="/admin/promociones"
          element={<AdminRoute element={<AdminPromociones />} requiredPermissions={[PERMISSIONS.PROMOTIONS_MANAGE]} />}
        />
        <Route
          path="/admin/correlativos"
          element={<AdminRoute element={<AdminCorrelativos />} requiredPermissions={[PERMISSIONS.SETTINGS_MANAGE]} />}
        />
        <Route
          path="/admin/respaldos"
          element={<AdminRoute element={<AdminRespaldos />} requiredPermissions={[PERMISSIONS.BACKUPS_MANAGE]} />}
        />
        <Route
          path="/admin/clientes"
          element={<AdminRoute element={<AdminClientes />} requiredPermissions={[PERMISSIONS.CUSTOMERS_MANAGE]} />}
        />
      </Routes>
    </Suspense>
  </CajaProvider>
);

export default AppRoutes;
