import { ReactNode } from "react";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HistoryIcon from "@mui/icons-material/History";
import { InventorySharp } from "@mui/icons-material";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import SettingsIcon from "@mui/icons-material/Settings";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import {
  PERMISSIONS,
  type PermissionCode,
  type UserRole,
} from "../../modules/auth";

export interface MenuItem {
  label: string;
  icon: ReactNode;
  route?: string;
  action?: () => void;
  disabled?: boolean;
  permission: PermissionCode;
  requiredPermissions?: PermissionCode[];
  allowedRoles?: UserRole[];
}

export const getMenuItems = (): MenuItem[] => [
  {
    label: "Facturar",
    icon: <PointOfSaleIcon fontSize="large" color="primary" />,
    route: "/facturacion",
    permission: PERMISSIONS.BILLING_CREATE,
    allowedRoles: ["admin", "cajero", "cajero_principal", "mesero", "despachador"],
  },
  {
    label: "Delivery",
    icon: <DeliveryDiningIcon fontSize="large" color="error" />,
    route: "/delivery",
    permission: PERMISSIONS.DELIVERY_MANAGE,
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },
  {
    label: "Entregas Motorizado",
    icon: <TwoWheelerIcon fontSize="large" color="error" />,
    route: "/mis-entregas",
    permission: PERMISSIONS.DELIVERY_READ,
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador", "motorizado"],
  },
  {
    label: "Pantalla de Cocina",
    icon: <SoupKitchenIcon fontSize="large" color="error" />,
    route: "/kds",
    permission: PERMISSIONS.KITCHEN_READ,
    requiredPermissions: [
      PERMISSIONS.ORDERS_READ,
      PERMISSIONS.KITCHEN_READ,
      PERMISSIONS.ORDERS_STATUS,
      PERMISSIONS.KITCHEN_UPDATE,
    ],
    allowedRoles: ["admin", "cajero", "cajero_principal", "cocinero", "despachador"],
  },
  {
    label: "Órdenes",
    icon: <ListAltIcon fontSize="large" color="secondary" />,
    route: "/ordenes",
    permission: PERMISSIONS.ORDERS_READ,
    allowedRoles: ["admin", "cajero", "cajero_principal", "mesero", "cocinero", "despachador"],
  },
  {
    label: "Mesas",
    icon: <TableRestaurantIcon fontSize="large" color="action" />,
    route: "/mesas",
    permission: PERMISSIONS.TABLES_READ,
    allowedRoles: ["admin", "cajero", "cajero_principal", "mesero", "despachador"],
  },
  {
    label: "Reportes",
    icon: <AssessmentIcon fontSize="large" color="success" />,
    route: "/reporte",
    permission: PERMISSIONS.REPORTS_READ,
    allowedRoles: ["admin"],
  },
  {
    label: "Ingresar Producto",
    icon: <InventorySharp fontSize="large" color="error" />,
    route: "/producto",
    permission: PERMISSIONS.PRODUCTS_MANAGE,
    allowedRoles: ["admin"],
  },
  {
    label: "Anular Factura",
    icon: <CancelIcon fontSize="large" color="error" />,
    route: "/anular-factura",
    permission: PERMISSIONS.INVOICES_CANCEL,
    requiredPermissions: [PERMISSIONS.INVOICES_CANCEL, PERMISSIONS.ORDERS_CANCEL],
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },
  {
    label: "Consultar Facturas",
    icon: <ReceiptIcon fontSize="large" color="primary" />,
    route: "/consultar-factura",
    permission: PERMISSIONS.INVOICES_READ,
    requiredPermissions: [PERMISSIONS.INVOICES_READ, PERMISSIONS.ORDERS_READ],
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },

  {
    label: "Abrir Caja",
    icon: <LocalAtmIcon fontSize="large" color="success" />,
    route: "/abrircaja",
    permission: PERMISSIONS.CASH_OPEN,
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },
  {
    label: "Cerrar Caja",
    icon: <LocalAtmIcon fontSize="large" color="error" />,
    route: "/cerrarcaja",
    permission: PERMISSIONS.CASH_CLOSE,
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },
  {
    label: "Consultar Turnos",
    icon: <HistoryIcon fontSize="large" color="warning" />,
    route: "/consultar-turnos",
    permission: PERMISSIONS.CASH_READ,
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },
  {
    label: "Gastos de Caja",
    icon: <MoneyOffIcon fontSize="large" color="error" />,
    route: "/gastos-caja",
    permission: PERMISSIONS.CASH_EXPENSES,
    allowedRoles: ["admin", "cajero", "cajero_principal", "despachador"],
  },
  {
    label: "Administración Caja",
    icon: <AdminPanelSettingsIcon fontSize="large" color="primary" />,
    route: "/admin/cajas",
    permission: PERMISSIONS.CASH_CONFIGURE,
    allowedRoles: ["admin"],
  },

  {
    label: "Configuración del Sistema",
    icon: <SettingsIcon fontSize="large" color="success" />,
    route: "/admin",
    permission: PERMISSIONS.SETTINGS_READ,
    allowedRoles: ["admin"],
  },
];
