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
import { PERMISSIONS, type PermissionCode } from "../../modules/auth";

export interface MenuItem {
  label: string;
  icon: ReactNode;
  route?: string;
  action?: () => void;
  disabled?: boolean;
  permission: PermissionCode;
}

export const getMenuItems = (): MenuItem[] => [
  {
    label: "Facturar",
    icon: <PointOfSaleIcon fontSize="large" color="primary" />,
    route: "/facturacion",
    permission: PERMISSIONS.BILLING_CREATE,
  },
  {
    label: "Delivery",
    icon: <DeliveryDiningIcon fontSize="large" color="error" />,
    route: "/delivery",
    permission: PERMISSIONS.DELIVERY_MANAGE,
  },
  {
    label: "Entregas Motorizado",
    icon: <TwoWheelerIcon fontSize="large" color="error" />,
    route: "/mis-entregas",
    permission: PERMISSIONS.DELIVERY_READ,
  },
  {
    label: "Pantalla de Cocina",
    icon: <SoupKitchenIcon fontSize="large" color="error" />,
    route: "/kds",
    permission: PERMISSIONS.KITCHEN_READ,
  },
  {
    label: "Órdenes",
    icon: <ListAltIcon fontSize="large" color="secondary" />,
    route: "/ordenes",
    permission: PERMISSIONS.ORDERS_READ,
  },
  {
    label: "Mesas",
    icon: <TableRestaurantIcon fontSize="large" color="action" />,
    route: "/mesas",
    permission: PERMISSIONS.TABLES_READ,
  },
  {
    label: "Reportes",
    icon: <AssessmentIcon fontSize="large" color="success" />,
    route: "/reporte",
    permission: PERMISSIONS.REPORTS_READ,
  },
  {
    label: "Ingresar Producto",
    icon: <InventorySharp fontSize="large" color="error" />,
    route: "/producto",
    permission: PERMISSIONS.PRODUCTS_MANAGE,
  },
  {
    label: "Anular Factura",
    icon: <CancelIcon fontSize="large" color="error" />,
    route: "/anular-factura",
    permission: PERMISSIONS.INVOICES_CANCEL,
  },
  {
    label: "Consultar Facturas",
    icon: <ReceiptIcon fontSize="large" color="primary" />,
    route: "/consultar-factura",
    permission: PERMISSIONS.INVOICES_READ,
  },

  {
    label: "Abrir Caja",
    icon: <LocalAtmIcon fontSize="large" color="success" />,
    route: "/abrircaja",
    permission: PERMISSIONS.CASH_OPEN,
  },
  {
    label: "Cerrar Caja",
    icon: <LocalAtmIcon fontSize="large" color="error" />,
    route: "/cerrarcaja",
    permission: PERMISSIONS.CASH_CLOSE,
  },
  {
    label: "Consultar Turnos",
    icon: <HistoryIcon fontSize="large" color="warning" />,
    route: "/consultar-turnos",
    permission: PERMISSIONS.CASH_READ,
  },
  {
    label: "Gastos de Caja",
    icon: <MoneyOffIcon fontSize="large" color="error" />,
    route: "/gastos-caja",
    permission: PERMISSIONS.CASH_EXPENSES,
  },
  {
    label: "Administración Caja",
    icon: <AdminPanelSettingsIcon fontSize="large" color="primary" />,
    route: "/admin/cajas",
    permission: PERMISSIONS.CASH_CONFIGURE,
  },

  {
    label: "Configuración del Sistema",
    icon: <SettingsIcon fontSize="large" color="success" />,
    route: "/admin",
    permission: PERMISSIONS.SETTINGS_READ,
  },
];
