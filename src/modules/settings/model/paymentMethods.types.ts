export const PAYMENT_METHOD_TYPES = [
  "CASH",
  "CARD_POS",
  "BANK_TRANSFER",
  "DIGITAL_WALLET",
] as const;
export const PAYMENT_CURRENCIES = ["NIO", "USD"] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];
export type PaymentCurrency = (typeof PAYMENT_CURRENCIES)[number];

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  CASH: "Efectivo",
  CARD_POS: "POS Tarjeta",
  BANK_TRANSFER: "Transferencia",
  DIGITAL_WALLET: "Billetera digital",
};

export interface ConfiguredPaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  currency: PaymentCurrency;
  requiresReference: boolean;
  commissionRate: number;
  isActive: boolean;
}

export interface PaymentMethodsConfig {
  methods: ConfiguredPaymentMethod[];
}

export interface PaymentMetricRow {
  methodId: string;
  name: string;
  type: string;
  currency: string;
  transactionCount: number;
  referencedCount: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
}

export interface PaymentMetrics {
  startDate: string;
  endDate: string;
  transactionCount: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  breakdown: PaymentMetricRow[];
}

export const DEFAULT_PAYMENT_METHODS_CONFIG: PaymentMethodsConfig = {
  methods: [
    {
      id: "cash-nio",
      name: "Efectivo Córdobas",
      type: "CASH",
      currency: "NIO",
      requiresReference: false,
      commissionRate: 0,
      isActive: true,
    },
    {
      id: "cash-usd",
      name: "Efectivo Dólares",
      type: "CASH",
      currency: "USD",
      requiresReference: false,
      commissionRate: 0,
      isActive: true,
    },
    {
      id: "card-generic",
      name: "POS Tarjeta",
      type: "CARD_POS",
      currency: "NIO",
      requiresReference: true,
      commissionRate: 2.5,
      isActive: true,
    },
    {
      id: "transfer-generic",
      name: "Transferencia bancaria",
      type: "BANK_TRANSFER",
      currency: "NIO",
      requiresReference: true,
      commissionRate: 0,
      isActive: true,
    },
  ],
};

const isType = (value: unknown): value is PaymentMethodType =>
  PAYMENT_METHOD_TYPES.includes(value as PaymentMethodType);
const isCurrency = (value: unknown): value is PaymentCurrency =>
  PAYMENT_CURRENCIES.includes(value as PaymentCurrency);

export const slugifyPaymentMethod = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

export function normalizePaymentMethodsConfig(
  value?: Partial<PaymentMethodsConfig> | null,
): PaymentMethodsConfig {
  const methods = Array.isArray(value?.methods)
    ? value.methods
        .filter((method) => method?.id && method?.name)
        .map((method) => ({
          id: String(method.id).slice(0, 80),
          name: String(method.name).trim().slice(0, 120),
          type: isType(method.type) ? method.type : "BANK_TRANSFER",
          currency: isCurrency(method.currency) ? method.currency : "NIO",
          requiresReference: Boolean(method.requiresReference),
          commissionRate: Math.min(
            100,
            Math.max(0, Number(method.commissionRate) || 0),
          ),
          isActive:
            typeof method.isActive === "boolean" ? method.isActive : true,
        }))
    : [];
  return {
    methods: methods.length
      ? methods
      : DEFAULT_PAYMENT_METHODS_CONFIG.methods.map((method) => ({ ...method })),
  };
}

export const toLegacyPaymentMethod = (method: ConfiguredPaymentMethod) => {
  if (method.type === "CASH") return "EFECTIVO" as const;
  if (method.type === "CARD_POS") return "TARJETA" as const;
  return "APP" as const;
};
