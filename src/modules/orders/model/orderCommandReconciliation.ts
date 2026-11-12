import type { Order } from "./order.types";

export function shouldApplyOrderUpdateResponse(
  current: Order,
  optimistic: Order,
  response: Order,
): boolean {
  if (current !== optimistic) return false;
  if (!current.updatedAt || !response.updatedAt) return true;
  return (
    new Date(response.updatedAt).getTime() >=
    new Date(current.updatedAt).getTime()
  );
}

export function shouldRollbackOrderUpdate(
  current: Order,
  optimistic: Order,
): boolean {
  return current === optimistic;
}
