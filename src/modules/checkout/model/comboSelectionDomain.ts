import type { Product } from "../../catalog";
import type { SelectedComboOptionItem } from "../../orders";

export interface ComboGroupValidation {
  groupId: string;
  groupName: string;
  requiredCount: number;
  selectedCount: number;
  isComplete: boolean;
}

/**
 * Valida el estado de selección de cada grupo de un combo.
 */
export function getComboGroupsStatus(
  combo: Product,
  selections: SelectedComboOptionItem[]
): ComboGroupValidation[] {
  if (!combo.comboGroups || combo.comboGroups.length === 0) {
    return [];
  }

  return combo.comboGroups.map((group) => {
    const selectedCount = selections
      .filter((s) => s.groupId === group.id)
      .reduce((sum, s) => sum + s.quantity, 0);

    return {
      groupId: group.id || "",
      groupName: group.name,
      requiredCount: group.requiredCount,
      selectedCount,
      isComplete: selectedCount === group.requiredCount,
    };
  });
}

/**
 * Retorna true si todos los grupos obligatorios del combo están 100% satisfechos.
 */
export function isComboFullySelected(
  combo: Product,
  selections: SelectedComboOptionItem[]
): boolean {
  const statuses = getComboGroupsStatus(combo, selections);
  if (statuses.length === 0) return true;
  return statuses.every((s) => s.isComplete);
}

/**
 * Calcula el precio unitario total del combo (precio base + recargos de opciones elegidas).
 */
export function calculateComboTotalPrice(
  combo: Product,
  selections: SelectedComboOptionItem[]
): number {
  const basePrice = Number(combo.comboPrice || 0);
  const extraTotal = selections.reduce((sum, s) => {
    const extra = Number(s.extraPrice || 0);
    return sum + extra * (s.quantity || 1);
  }, 0);

  return basePrice + extraTotal;
}

/**
 * Genera una representación textual legible de las elecciones del combo.
 * Ejemplo: "2x Pizza Pepperoni (Grande), 1x Pepsi 2L, 1x Pan con Ajo"
 */
export function formatComboSelectionsSummary(
  selections?: SelectedComboOptionItem[]
): string {
  if (!selections || selections.length === 0) return "";

  return selections
    .map((s) => {
      const sizeText = s.size && s.size !== "único" ? ` (${s.size})` : "";
      const extraText = s.extraPrice && s.extraPrice > 0 ? ` (+C$${s.extraPrice.toFixed(2)})` : "";
      return `${s.quantity}x ${s.productName}${sizeText}${extraText}`;
    })
    .join(", ");
}
