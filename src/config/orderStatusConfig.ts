import { OrderStatus } from "../types/order.types";

export const statusColors: Record<OrderStatus, "default" | "primary" | "secondary" | "error" | "info" | "success"> = {
  pending: "info",
  preparing: "primary",
  ready: "success",
  delivered: "default",
  cancelled: "error",
  paid: "success",
};

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
  paid: "Pagado",
};
