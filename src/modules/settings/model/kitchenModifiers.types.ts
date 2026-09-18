export const KITCHEN_MODIFIER_KINDS = [
  "REMOVE",
  "ADD",
  "PREPARATION",
  "SERVICE",
] as const;

export type KitchenModifierKind = (typeof KITCHEN_MODIFIER_KINDS)[number];

export interface KitchenModifierSelection {
  id: string;
  label: string;
  kind: KitchenModifierKind;
}

export interface KitchenModifier extends KitchenModifierSelection {
  categoryIds: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface KitchenModifiersConfig {
  modifiers: KitchenModifier[];
}

export const KITCHEN_MODIFIER_KIND_LABELS: Record<KitchenModifierKind, string> =
  {
    REMOVE: "Quitar",
    ADD: "Agregar / Extra",
    PREPARATION: "Término / Preparación",
    SERVICE: "Servicio y Corte",
  };

export const KITCHEN_MODIFIER_PREFIXES: Record<KitchenModifierKind, string> = {
  REMOVE: "[-]",
  ADD: "[+]",
  PREPARATION: "[*]",
  SERVICE: "[/]",
};

export const KITCHEN_MODIFIER_COLORS: Record<
  KitchenModifierKind,
  "error" | "success" | "warning" | "info"
> = {
  REMOVE: "error",
  ADD: "success",
  PREPARATION: "warning",
  SERVICE: "info",
};

const DEFAULT_LABELS: Array<Pick<KitchenModifier, "label" | "kind">> = [
  { label: "Sin Cebolla", kind: "REMOVE" },
  { label: "Sin Chile", kind: "REMOVE" },
  { label: "Sin Orégano", kind: "REMOVE" },
  { label: "Sin Hongos", kind: "REMOVE" },
  { label: "Extra Salsa de Tomate", kind: "ADD" },
  { label: "Albahaca Fresca", kind: "ADD" },
  { label: "Ajo", kind: "ADD" },
  { label: "Masa Delgada", kind: "PREPARATION" },
  { label: "Masa Gruesa", kind: "PREPARATION" },
  { label: "Bien Dorada / Tostada", kind: "PREPARATION" },
  { label: "Poca Salsa", kind: "PREPARATION" },
  { label: "Corte en 4", kind: "SERVICE" },
  { label: "Corte en 8", kind: "SERVICE" },
  { label: "Sin Cortar", kind: "SERVICE" },
  { label: "Salsa Aparte", kind: "SERVICE" },
  { label: "Para Llevar", kind: "SERVICE" },
];

export const slugifyKitchenModifier = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

export const DEFAULT_KITCHEN_MODIFIERS_CONFIG: KitchenModifiersConfig = {
  modifiers: DEFAULT_LABELS.map((modifier, index) => ({
    ...modifier,
    id: slugifyKitchenModifier(modifier.label),
    categoryIds: [],
    isActive: true,
    sortOrder: index,
  })),
};

const isKind = (value: unknown): value is KitchenModifierKind =>
  KITCHEN_MODIFIER_KINDS.includes(value as KitchenModifierKind);

export function normalizeKitchenModifiersConfig(
  value?: Partial<KitchenModifiersConfig> | null,
): KitchenModifiersConfig {
  if (!Array.isArray(value?.modifiers)) {
    return DEFAULT_KITCHEN_MODIFIERS_CONFIG;
  }

  const seen = new Set<string>();
  const modifiers = value.modifiers
    .map((raw, index) => {
      const label = String(raw?.label ?? "")
        .trim()
        .slice(0, 80);
      const baseId = String(raw?.id ?? slugifyKitchenModifier(label))
        .trim()
        .slice(0, 80);
      if (!label || !baseId || seen.has(baseId)) return null;
      seen.add(baseId);
      return {
        id: baseId,
        label,
        kind: isKind(raw?.kind) ? raw.kind : "PREPARATION",
        categoryIds: Array.isArray(raw?.categoryIds)
          ? [...new Set(raw.categoryIds.map(String).filter(Boolean))].slice(
              0,
              50,
            )
          : [],
        isActive: raw?.isActive !== false,
        sortOrder: Number.isFinite(raw?.sortOrder)
          ? Number(raw.sortOrder)
          : index,
      } satisfies KitchenModifier;
    })
    .filter((modifier): modifier is KitchenModifier => modifier !== null)
    .sort(
      (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
    );

  return { modifiers };
}

export const formatKitchenModifier = (modifier: KitchenModifierSelection) =>
  `${KITCHEN_MODIFIER_PREFIXES[modifier.kind]} ${modifier.label}`;
