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

export interface MenuItem {
  label: string;
  icon: ReactNode;
  route?: string;
  action?: () => void;
  disabled?: boolean;
}

export const getMenuItems = (): MenuItem[] => [
  {
    label: "Facturar",
    icon: <PointOfSaleIcon fontSize="large" color="primary" />,
    route: "/facturacion",
  },
  {
    label: "Delivery",
    icon: <DeliveryDiningIcon fontSize="large" color="error" />,
    route: "/delivery",
  },
  {
    label: "Entregas Motorizado",
    icon: <TwoWheelerIcon fontSize="large" color="error" />,
    route: "/mis-entregas",
  },
  {
    label: "Pantalla de Cocina",
    icon: <SoupKitchenIcon fontSize="large" color="error" />,
    route: "/kds",
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
    label: "Gastos de Caja",
    icon: <MoneyOffIcon fontSize="large" color="error" />,
    route: "/gastos-caja",
  },
  {
    label: "Administración Caja",
    icon: <AdminPanelSettingsIcon fontSize="large" color="primary" />,
    route: "/admin/cajas",
  },

  {
    label: "Configuración del Sistema",
    icon: <SettingsIcon fontSize="large" color="success" />,
    route: "/admin",
  },
];
