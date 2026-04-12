import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import PercentIcon from "@mui/icons-material/Percent";
import PeopleIcon from "@mui/icons-material/People";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import PrintIcon from "@mui/icons-material/Print";
import SecurityIcon from "@mui/icons-material/Security";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SaveIcon from "@mui/icons-material/Save";

export type AdminCategory = "General" | "Operativa" | "Hardware y Sistema";

export interface AdminModuleItem {
  id: string;
  category: AdminCategory;
  title: string;
  description: string;
  icon: JSX.Element;
  path?: string;
  action?: () => void;
}

export const adminModules: AdminModuleItem[] = [
  // --- GENERAL ---
  {
    id: "empresa",
    category: "General",
    title: "Datos de la Empresa",
    description: "Personaliza el logotipo, nombre de negocio, dirección, teléfono y pie de página de los tickets.",
    icon: <BusinessIcon fontSize="large" />,
    action: () => console.log("Ir a Empresa"),
  },
  {
    id: "configuracion",
    category: "General",
    title: "Control General",
    description: "Ajusta las preferencias del sistema, moneda local y comportamiento en la apertura de caja.",
    icon: <SettingsIcon fontSize="large" />,
    path: "/admin/configuracion",
  },
  {
    id: "impuestos",
    category: "General",
    title: "Impuestos",
    description: "Gestiona múltiples tasas impositivas y reglas especiales aisladas de la configuración habitual.",
    icon: <PercentIcon fontSize="large" />,
    path: "/admin/impuestos",
  },

  // --- OPERATIVA ---
  {
    id: "usuarios",
    category: "Operativa",
    title: "Usuarios y Roles",
    description: "Administra el acceso al sistema, crea empleados y asigna permisos específicos por rol.",
    icon: <PeopleIcon fontSize="large" />,
    action: () => console.log("Ir a Usuarios"),
  },
  {
    id: "promociones",
    category: "Operativa",
    title: "Promociones",
    description: "Configura reglas automáticas de descuento, horas felices (Happy Hour) o cupones manuales.",
    icon: <LocalOfferIcon fontSize="large" />,
    action: () => console.log("Ir a Promociones"),
  },
  {
    id: "turnos",
    category: "Operativa",
    title: "Cajas y Turnos",
    description: "Define perfiles de turnos laborales y fija los montos de apertura en efectivo predeterminados.",
    icon: <AccessTimeIcon fontSize="large" />,
    path: "/admin/cajas",
  },
  {
    id: "mesas",
    category: "Operativa",
    title: "Plano de Mesas",
    description: "Edita visualmente el diseño del restaurante, acomodando identificadores y salas libremente.",
    icon: <DashboardCustomizeIcon fontSize="large" />,
    path: "/admin/mesas",
  },
  
  // --- HARDWARE Y SISTEMA ---
  {
    id: "perifericos",
    category: "Hardware y Sistema",
    title: "Periféricos",
    description: "Administra impresoras térmicas (Múltiples), gavetas de dinero conectadas o básculas compatibles.",
    icon: <PrintIcon fontSize="large" />,
    action: () => console.log("Ir a Periféricos"),
  },
  {
    id: "auditoria",
    category: "Hardware y Sistema",
    title: "Bitácora de Auditoría",
    description: "Revisa el registro de auditoría de arqueos, cancelaciones de factura y movimientos sensibles.",
    icon: <SecurityIcon fontSize="large" />,
    action: () => console.log("Ir a Auditoría"),
  },
  {
    id: "facturacion_electronica",
    category: "Hardware y Sistema",
    title: "Correlativos Factura",
    description: "Gestiona los números de comprobante, rangos de folio autorizados y secuencias de facturación.",
    icon: <ReceiptLongIcon fontSize="large" />,
    action: () => console.log("Ir a Correlativos"),
  },
  {
    id: "respaldos",
    category: "Hardware y Sistema",
    title: "Respaldos de Datos",
    description: "Exporta la configuración, menú e histórico. Crea y restaura copias de seguridad totales.",
    icon: <SaveIcon fontSize="large" />,
    action: () => console.log("Ir a Respaldos"),
  }
];
