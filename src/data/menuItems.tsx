import { ReactNode } from "react";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import { InventorySharp } from "@mui/icons-material";

export interface MenuItem {
  label: string;
  icon: ReactNode;
  route?: string;
  action?: () => void;
  disabled?: boolean;
}

/**
 * Retorna los items del menú principal.
 * Si el item tiene `route`, la navegación se resuelve en el componente padre.
 * Si tiene `action`, se ejecuta directamente.
 */
export const getMenuItems = (): MenuItem[] => [
  {
    label: "Facturar",
    icon: <PointOfSaleIcon fontSize="large" color="primary" />,
    route: "/facturacion",
  },
  {
    label: "Órdenes",
    icon: <ListAltIcon fontSize="large" color="secondary" />,
    route: "/ordenes",
  },
  {
    label: "Mesas",
    icon: <TableRestaurantIcon fontSize="large" color="action" />,
    route: "/mesas",
  },
  {
    label: "Reportes",
    icon: <AssessmentIcon fontSize="large" color="success" />,
    route: "/reporte",
  },
  {
    label: "Ingresar Producto",
    icon: <InventorySharp fontSize="large" color="error" />,
    route: "/producto",
  },
  {
    label: "Anular Factura",
    icon: <CancelIcon fontSize="large" color="error" />,
    route: "/anular-factura",
  },
  {
    label: "Consultar Facturas",
    icon: <ReceiptIcon fontSize="large" color="primary" />,
    route: "/consultar-factura",
  },

  {
    label: "Abrir Caja",
    icon: <LocalAtmIcon fontSize="large" color="success" />,
    route: "/abrircaja",
  },
  {
    label: "Cerrar Caja",
    icon: <LocalAtmIcon fontSize="large" color="error" />,
    route: "/cerrarcaja",
  },
  {
    label: "Consultar Turnos",
    icon: <HistoryIcon fontSize="large" color="warning" />,
    route: "/consultar-turnos",
  },
  {
    label: "Administración Caja",
    icon: <AdminPanelSettingsIcon fontSize="large" color="primary" />,
    route: "/admin/cajas",
  },
  {
    label: "Cuentas",
    icon: <AccountBalanceWalletIcon fontSize="large" color="action" />,
    route: "/cuentas",
  },
  {
    label: "Administración",
    icon: <AdminPanelSettingsIcon fontSize="large" color="success" />,
    route: "/admin",
  },
  {
    label: "Abrir Caja Dinero",
    icon: <LocalAtmIcon fontSize="large" color="secondary" />,
    action: () => console.log("Abrir Caja de Dinero"),
  },

];
