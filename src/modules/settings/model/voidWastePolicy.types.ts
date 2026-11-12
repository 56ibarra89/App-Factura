export const CANCELLATION_CATEGORIES = [
  "KITCHEN",
  "CUSTOMER",
  "SERVICE",
  "COURTESY",
  "OTHER",
] as const;

export type CancellationCategory = (typeof CANCELLATION_CATEGORIES)[number];

export const CANCELLATION_CATEGORY_LABELS: Record<
  CancellationCategory,
  string
> = {
  KITCHEN: "Falla de cocina",
  CUSTOMER: "Cancelación del cliente",
  SERVICE: "Error de servicio",
  COURTESY: "Cortesía",
  OTHER: "Otro",
};

export interface CancellationReasonPolicy {
  id: string;
  label: string;
  category: CancellationCategory;
  isActive: boolean;
  countsAsWaste: boolean;
  requiresSupervisor: boolean;
}

export interface VoidWastePolicyConfig {
  requireSupervisorForPaidOrders: boolean;
  requireSupervisorWhenPreparationStarted: boolean;
  reasons: CancellationReasonPolicy[];
}

export interface CancellationMetricGroup {
  category?: string;
  reasonId?: string;
  label?: string;
  count: number;
  amount: number;
}

export interface CancellationMetrics {
  startDate: string;
  endDate: string;
  totalCancelledOrders: number;
  totalAffectedAmount: number;
  totalWasteAmount: number;
  byCategory: CancellationMetricGroup[];
  byReason: CancellationMetricGroup[];
}

export const DEFAULT_VOID_WASTE_POLICY_CONFIG: VoidWastePolicyConfig = {
  requireSupervisorForPaidOrders: true,
  requireSupervisorWhenPreparationStarted: true,
  reasons: [
    {
      id: "pizza-quemada",
      label: "Pizza quemada en horno",
      category: "KITCHEN",
      isActive: true,
      countsAsWaste: true,
      requiresSupervisor: true,
    },
    {
      id: "cliente-cancelo-tardanza",
      label: "Cliente canceló por tardanza en delivery",
      category: "CUSTOMER",
      isActive: true,
      countsAsWaste: false,
      requiresSupervisor: false,
    },
    {
      id: "error-comanda-mesero",
      label: "Error de comanda del mesero",
      category: "SERVICE",
      isActive: true,
      countsAsWaste: false,
      requiresSupervisor: false,
    },
    {
      id: "cortesia-gerencia",
      label: "Cortesía de la casa / Gerencia",
      category: "COURTESY",
      isActive: true,
      countsAsWaste: false,
      requiresSupervisor: true,
    },
  ],
};

const isCategory = (value: unknown): value is CancellationCategory =>
  CANCELLATION_CATEGORIES.includes(value as CancellationCategory);

export const slugifyCancellationReason = (label: string) =>
  label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

export function normalizeVoidWastePolicyConfig(
  value?: Partial<VoidWastePolicyConfig> | null,
): VoidWastePolicyConfig {
  const reasons = Array.isArray(value?.reasons)
    ? value.reasons
        .filter((reason) => reason && reason.id && reason.label)
        .map((reason) => ({
          id: String(reason.id).slice(0, 80),
          label: String(reason.label).slice(0, 160),
          category: isCategory(reason.category) ? reason.category : "OTHER",
          isActive:
            typeof reason.isActive === "boolean" ? reason.isActive : true,
          countsAsWaste: Boolean(reason.countsAsWaste),
          requiresSupervisor: Boolean(reason.requiresSupervisor),
        }))
    : [];
  return {
    requireSupervisorForPaidOrders:
      typeof value?.requireSupervisorForPaidOrders === "boolean"
        ? value.requireSupervisorForPaidOrders
        : true,
    requireSupervisorWhenPreparationStarted:
      typeof value?.requireSupervisorWhenPreparationStarted === "boolean"
        ? value.requireSupervisorWhenPreparationStarted
        : true,
    reasons: reasons.length
      ? reasons
      : DEFAULT_VOID_WASTE_POLICY_CONFIG.reasons.map((reason) => ({
          ...reason,
        })),
  };
}
