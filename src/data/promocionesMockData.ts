/**
 * OCP: Datos mock centralizados para los tabs de Promociones.
 * Los componentes tab reciben estos datos como props → no necesitan ser
 * modificados cuando se conecte una fuente de datos real (API, contexto, etc.).
 */

// ── Tipos de dominio ────────────────────────────────────────────────────────

export type PromoStatus = "Activo" | "Inactivo" | "Agotado";

export interface HappyHourRule {
  id: number;
  name: string;
  /** Días seleccionados, ej. ["Jue", "Vie", "Sab"] */
  daysOfWeek: string[];
  /** Hora de inicio en formato HH:mm */
  startTime: string;
  /** Hora de fin en formato HH:mm */
  endTime: string;
  /** Tipo de promoción */
  promotionType: "2x1" | "porcentaje" | "monto_fijo";
  /** Valor numérico (solo para porcentaje y monto_fijo) */
  promotionValue: string;
  status: "Activo" | "Inactivo";
  // Campos derivados calculados al guardar — usados solo para la tarjeta visual
  days: string;
  time: string;
  promotion: string;
}

export interface DescuentoRule {
  id: number;
  name: string;
  type: string;
  value: string;
  status: "Activo" | "Inactivo";
  appliesTo: string;
}

export interface CuponRule {
  id: number;
  code: string;
  discount: string;
  usage: string;
  expires: string;
  status: "Activo" | "Agotado" | "Inactivo";
}

export interface CertificadoRule {
  id: number;
  serial: string;
  origin: string;
  product: string;
  issueDate: string;
  status: "Disponible" | "Entregado";
}

// ── Datos mock ──────────────────────────────────────────────────────────────

export const MOCK_HAPPY_HOURS: HappyHourRule[] = [
  {
    id: 1,
    name: "Happy Hour Cervezas",
    daysOfWeek: ["Jue", "Vie", "Sab"],
    startTime: "18:00",
    endTime: "21:00",
    promotionType: "2x1",
    promotionValue: "",
    status: "Activo",
    days: "Jue, Vie, Sab",
    time: "18:00 - 21:00",
    promotion: "2x1",
  },
  {
    id: 2,
    name: "Almuerzo Ejecutivo",
    daysOfWeek: ["Lun", "Mar", "Mié", "Jue", "Vie"],
    startTime: "12:00",
    endTime: "15:00",
    promotionType: "porcentaje",
    promotionValue: "20",
    status: "Inactivo",
    days: "Lun - Vie",
    time: "12:00 - 15:00",
    promotion: "-20% en Platos Fuertes",
  },
];

export const MOCK_DESCUENTOS: DescuentoRule[] = [
  {
    id: 1,
    name: "Descuento Empleados",
    type: "Porcentaje",
    value: "20%",
    status: "Activo",
    appliesTo: "Toda la cuenta",
  },
  {
    id: 2,
    name: "Descuento Cumpleañero",
    type: "Monto Fijo",
    value: "$150.00",
    status: "Activo",
    appliesTo: "Solo Bebidas",
  },
];

export const MOCK_CUPONES: CuponRule[] = [
  {
    id: 1,
    code: "VERANO2026",
    discount: "15%",
    usage: "14 / 50",
    expires: "2026-08-31",
    status: "Activo",
  },
  {
    id: 2,
    code: "BIENVENIDA",
    discount: "$50.00",
    usage: "120 / ∞",
    expires: "Sin límite",
    status: "Activo",
  },
  {
    id: 3,
    code: "FLASH50",
    discount: "50%",
    usage: "10 / 10",
    expires: "2026-04-01",
    status: "Agotado",
  },
];

export const MOCK_CERTIFICADOS: CertificadoRule[] = [
  {
    id: 1,
    serial: "VC-847291",
    origin: "Agencia de Viajes Sol",
    product: "Pizza Familiar Pepperoni",
    issueDate: "2026-01-15",
    status: "Entregado",
  },
  {
    id: 2,
    serial: "VC-109344",
    origin: "Cliente Frecuente (Premio)",
    product: "Hamburguesa Doble c/ Papas",
    issueDate: "2026-04-20",
    status: "Disponible",
  },
  {
    id: 3,
    serial: "VC-554212",
    origin: "Empresa Coca-Cola",
    product: "Refresco 2L",
    issueDate: "2026-04-25",
    status: "Disponible",
  },
];
