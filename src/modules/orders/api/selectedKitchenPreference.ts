import { localStore } from "../../../shared/storage";

const SELECTED_KITCHEN_KEY = "selectedKitchenId";

export function getSelectedKitchenId(): string {
  return localStore.getItem(SELECTED_KITCHEN_KEY) || "";
}

export function setSelectedKitchenId(kitchenId: string): void {
  localStore.setItem(SELECTED_KITCHEN_KEY, kitchenId);
}
