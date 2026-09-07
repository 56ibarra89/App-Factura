export type CashExpenseCategory =
  | "SERVICIOS_BASICOS"
  | "INSUMOS_URGENTES"
  | "LIMPIEZA_MANTENIMIENTO"
  | "PAGO_PROVEEDOR"
  | "ADELANTO_SUELDO"
  | "TRANSPORTE_FLETE"
  | "OTROS";

export const CASH_EXPENSE_CATEGORY_LABELS: Record<
  CashExpenseCategory,
  { label: string; description: string; color: string }
> = {
  SERVICIOS_BASICOS: {
    label: "Servicios Básicos",
    description: "Energía eléctrica, agua, internet, gas, etc.",
    color: "#f57c00",
  },
  INSUMOS_URGENTES: {
    label: "Insumos de Emergencia",
    description: "Hielo, verduras, panadería urgente, ingredientes.",
    color: "#d32f2f",
  },
  LIMPIEZA_MANTENIMIENTO: {
    label: "Limpieza y Mantenimiento",
    description: "Artículos de limpieza, reparaciones menores.",
    color: "#0288d1",
  },
  PAGO_PROVEEDOR: {
    label: "Pago a Proveedor",
    description: "Pago de contado a proveedores locales.",
    color: "#7b1fa2",
  },
  ADELANTO_SUELDO: {
    label: "Adelanto de Sueldo",
    description: "Adelantos de nómina autorizados.",
    color: "#388e3c",
  },
  TRANSPORTE_FLETE: {
    label: "Transporte y Flete",
    description: "Combustible, encomiendas, mandados operativos.",
    color: "#e65100",
  },
  OTROS: {
    label: "Otros Gastos",
    description: "Gastos menores no categorizados.",
    color: "#616161",
  },
};

export interface CashExpense {
  id: string;
  shiftId: string;
  amount: number;
  category: CashExpenseCategory;
  reason: string;
  voucherNumber?: string;
  notes?: string;
  cashierId?: string;
  cashierSnapshotName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCashExpenseDto {
  amount: number;
  category: CashExpenseCategory;
  reason: string;
  voucherNumber?: string;
  notes?: string;
  shiftId?: string;
}

export interface ListCashExpensesQuery {
  shiftId?: string;
  cashierId?: string;
  category?: CashExpenseCategory;
  startDate?: string;
  endDate?: string;
}

export interface CategoryPolicyConfig {
  enabled: boolean;
  requiresPin: boolean;
}

export interface PettyCashPolicy {
  maxAmountWithoutAuth: number;
  maxShiftTotal: number;
  requireVoucherOver: number;
  requireVoucherAlways: boolean;
  autoPrintVoucher: boolean;
  categoryPolicies: Record<CashExpenseCategory, CategoryPolicyConfig>;
}

export const DEFAULT_PETTY_CASH_POLICY: PettyCashPolicy = {
  maxAmountWithoutAuth: 250,
  maxShiftTotal: 1500,
  requireVoucherOver: 100,
  requireVoucherAlways: false,
  autoPrintVoucher: true,
  categoryPolicies: {
    INSUMOS_URGENTES: { enabled: true, requiresPin: false },
    LIMPIEZA_MANTENIMIENTO: { enabled: true, requiresPin: false },
    TRANSPORTE_FLETE: { enabled: true, requiresPin: false },
    SERVICIOS_BASICOS: { enabled: true, requiresPin: false },
    PAGO_PROVEEDOR: { enabled: true, requiresPin: true },
    ADELANTO_SUELDO: { enabled: true, requiresPin: true },
    OTROS: { enabled: true, requiresPin: false },
  },
};

