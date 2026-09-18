import {
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  KitchenStatus,
  SelectedComboOptionItem,
} from "../model/order.types";
import { apiClient } from "../../../shared/api";
import type { KitchenModifierSelection } from "../../settings/model/kitchenModifiers.types";

interface BackendExtra {
  name: string;
  price: number | string;
}

interface BackendItem {
  id?: string | number;
  productId?: string;
  categoryId?: string;
  name: string;
  price: number | string;
  size: string;
  quantity: number | string;
  extras: BackendExtra[];
  note?: string;
  kitchenModifiers?: KitchenModifierSelection[];
  giftQuantity?: number;
  giftReason?: string;
  isSentToKitchen?: boolean;
  sentAt?: string | Date;
  kitchenStatus?: string;
  kitchenId?: string;
  isCombo?: boolean;
  comboSelections?: SelectedComboOptionItem[];
}

const toKitchenModifierPayload = (
  modifiers?: KitchenModifierSelection[],
): KitchenModifierSelection[] | undefined =>
  modifiers?.map(({ id, label, kind }) => ({ id, label, kind }));

export interface BackendOrder {
  id: string;
  items: BackendItem[];
  subTotal?: number | string | null;
  discountAmount?: number | string | null;
  taxAmount?: number | string | null;
  total: number | string;
  customerTendered?: number | string | null;
  deliveryChange?: number | string | null;
  kitchenReadyAt?: string | Date | null;
  deliveryStartedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  status: string;
  timestamp: string | Date;
  customerSnapshotName?: string;
  customerPhone?: string;
  customerId?: string;
  customer?: { id?: string; name?: string; phone?: string | null };
  orderType?: string;
  customerAddress?: string;
  driverId?: string;
  promotionSource?: string;
  promotionCode?: string;
  cuponId?: number | null;
  discountId?: number | null;
  happyHourId?: number | null;
  linkedTables?: string[];
  payments?: {
    method: string;
    amount: number | string;
    cashierId?: string;
    cashierSnapshotName?: string;
    reference?: string;
    methodConfigId?: string;
    methodSnapshotName?: string;
    methodType?: string;
    currency?: string;
    originalAmount?: number | string;
    exchangeRate?: number | string;
    commissionRate?: number | string;
    commissionAmount?: number | string;
  }[];
  cashierSnapshotName?: string;
  isSentToKitchen?: boolean;
  invoice?: { invoiceNumber: string };
  invoiceNumber?: string;
}

export function mapBackendOrderToFrontend(backendOrder: BackendOrder): Order {
  const hasMultiplePayments =
    backendOrder.payments && backendOrder.payments.length > 1;
  const rawPaymentMethod =
    backendOrder.payments && backendOrder.payments.length > 0
      ? backendOrder.payments[0].method.toUpperCase()
      : undefined;

  return {
    id: backendOrder.id,
    items: backendOrder.items.map((i: BackendItem) => ({
      id: i.id ? Number(i.id) : undefined,
      productId: i.productId,
      categoryId: i.categoryId,
      name: i.name,
      price: Number(i.price),
      size: i.size.toLowerCase(),
      quantity: Number(i.quantity),
      extras: (i.extras || []).map((e: BackendExtra) => ({
        name: e.name,
        price: Number(e.price),
      })),
      note: i.note,
      kitchenModifiers: toKitchenModifierPayload(i.kitchenModifiers),
      giftQuantity: i.giftQuantity,
      giftReason: i.giftReason,
      isSentToKitchen: i.isSentToKitchen,
      sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
      kitchenStatus: i.kitchenStatus
        ? (i.kitchenStatus.toLowerCase() as KitchenStatus)
        : undefined,
      kitchenId: i.kitchenId,
      isCombo: Boolean(i.isCombo),
      comboSelections: i.comboSelections ? i.comboSelections : undefined,
    })),
    subTotal:
      backendOrder.subTotal !== null && backendOrder.subTotal !== undefined
        ? Number(backendOrder.subTotal)
        : undefined,
    discountAmount:
      backendOrder.discountAmount !== null &&
      backendOrder.discountAmount !== undefined
        ? Number(backendOrder.discountAmount)
        : undefined,
    taxAmount:
      backendOrder.taxAmount !== null && backendOrder.taxAmount !== undefined
        ? Number(backendOrder.taxAmount)
        : undefined,
    total: Number(backendOrder.total),
    customerTendered:
      backendOrder.customerTendered !== null &&
      backendOrder.customerTendered !== undefined
        ? Number(backendOrder.customerTendered)
        : undefined,
    deliveryChange:
      backendOrder.deliveryChange !== null &&
      backendOrder.deliveryChange !== undefined
        ? Number(backendOrder.deliveryChange)
        : undefined,
    kitchenReadyAt: backendOrder.kitchenReadyAt
      ? new Date(backendOrder.kitchenReadyAt)
      : undefined,
    deliveryStartedAt: backendOrder.deliveryStartedAt
      ? new Date(backendOrder.deliveryStartedAt)
      : undefined,
    deliveredAt: backendOrder.deliveredAt
      ? new Date(backendOrder.deliveredAt)
      : undefined,
    status: backendOrder.status.toLowerCase() as OrderStatus,
    timestamp: new Date(backendOrder.timestamp),
    customerName:
      backendOrder.customerSnapshotName ||
      backendOrder.customer?.name ||
      undefined,
    customerPhone:
      backendOrder.customerPhone || backendOrder.customer?.phone || undefined,
    customerId:
      backendOrder.customerId || backendOrder.customer?.id || undefined,
    orderType: backendOrder.orderType
      ? (backendOrder.orderType.toLowerCase() as OrderType)
      : undefined,
    customerAddress: backendOrder.customerAddress || undefined,
    driverId: backendOrder.driverId || undefined,
    promotionSource: backendOrder.promotionSource
      ? (backendOrder.promotionSource as Order["promotionSource"])
      : undefined,
    promotionCode: backendOrder.promotionCode || undefined,
    couponId: backendOrder.cuponId ?? undefined,
    discountId: backendOrder.discountId ?? undefined,
    happyHourId: backendOrder.happyHourId ?? undefined,
    tableId:
      backendOrder.linkedTables && backendOrder.linkedTables.length > 0
        ? backendOrder.linkedTables[0]
        : undefined,
    linkedTables: backendOrder.linkedTables,
    splitAmounts: hasMultiplePayments
      ? {
          efectivo: Number(
            backendOrder.payments?.find(
              (p) => p.method.toUpperCase() === "EFECTIVO",
            )?.amount || 0,
          ),
          tarjeta: Number(
            backendOrder.payments?.find(
              (p) => p.method.toUpperCase() === "TARJETA",
            )?.amount || 0,
          ),
          app: Number(
            backendOrder.payments?.find((p) => p.method.toUpperCase() === "APP")
              ?.amount || 0,
          ),
        }
      : undefined,
    payments: backendOrder.payments?.map((p) => ({
      method: p.method.toUpperCase() as "EFECTIVO" | "TARJETA" | "APP",
      amount: Number(p.amount),
      cashierSnapshotName: p.cashierSnapshotName,
      reference: p.reference,
      methodConfigId: p.methodConfigId,
      methodSnapshotName: p.methodSnapshotName,
      methodType: p.methodType,
      currency: p.currency,
      originalAmount:
        p.originalAmount === undefined ? undefined : Number(p.originalAmount),
      exchangeRate:
        p.exchangeRate === undefined ? undefined : Number(p.exchangeRate),
      commissionRate:
        p.commissionRate === undefined ? undefined : Number(p.commissionRate),
      commissionAmount:
        p.commissionAmount === undefined
          ? undefined
          : Number(p.commissionAmount),
    })),
    paymentMethod: (hasMultiplePayments ? "MIXTO" : rawPaymentMethod) as
      | PaymentMethod
      | undefined,
    cashierName: backendOrder.cashierSnapshotName || undefined,
    isSentToKitchen: backendOrder.isSentToKitchen,
    invoiceNumber:
      backendOrder.invoice?.invoiceNumber ||
      backendOrder.invoiceNumber ||
      undefined,
  };
}

export async function fetchOrdersFromBackend(): Promise<Order[]> {
  const data = await apiClient("/orders?scope=todayOrActive");
  return data.map(mapBackendOrderToFrontend);
}

export async function fetchOrdersByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<Order[]> {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  const data = await apiClient(`/orders?startDate=${start}&endDate=${end}`);
  return data.map(mapBackendOrderToFrontend);
}

export async function syncAddOrderToBackend(order: Order): Promise<Order> {
  const payload = {
    id: order.id,
    items: order.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      size: i.size.toLowerCase() === "unico" ? "único" : i.size.toLowerCase(),
      quantity: i.quantity,
      extras: i.extras
        ? i.extras.map((e) => ({ name: e.name, price: e.price }))
        : [],
      note: i.note,
      kitchenModifiers: toKitchenModifierPayload(i.kitchenModifiers),
      giftQuantity: i.giftQuantity || 0,
      giftReason: i.giftReason,
      isSentToKitchen: !!i.isSentToKitchen,
      sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
      kitchenStatus: i.kitchenStatus,
      kitchenId: i.kitchenId,
      isCombo: Boolean(i.isCombo),
      comboSelections: i.comboSelections || undefined,
    })),
    total: order.total,
    subTotal: order.subTotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    status: order.status.toLowerCase(),
    timestamp: order.timestamp.toISOString(),
    customerId: order.customerId,
    customerSnapshotName: order.customerName,
    customerPhone: order.customerPhone,
    orderType: order.orderType ? order.orderType.toLowerCase() : undefined,
    customerAddress: order.customerAddress,
    driverId: order.driverId,
    customerTendered: order.customerTendered,
    deliveryChange: order.deliveryChange,
    promotionCode: order.promotionCode,
    cuponId: order.couponId,
    promotionSource: order.promotionSource,
    discountId: order.discountId,
    happyHourId: order.happyHourId,
    certificateSerials: order.certificateSerials,
    cashierSnapshotName: order.cashierName,
    isSentToKitchen: order.isSentToKitchen,
    linkedTables:
      order.linkedTables && order.linkedTables.length > 0
        ? order.linkedTables
        : order.tableId
          ? [order.tableId]
          : undefined,
    payments: order.payments?.length
      ? order.payments
      : order.paymentMethod
        ? order.paymentMethod === "MIXTO" && order.splitAmounts
          ? [
              { method: "EFECTIVO", amount: order.splitAmounts.efectivo || 0 },
              { method: "TARJETA", amount: order.splitAmounts.tarjeta || 0 },
              { method: "APP", amount: order.splitAmounts.app || 0 },
            ].filter((p) => p.amount > 0)
          : [
              {
                method: order.paymentMethod.toUpperCase(),
                amount: order.total,
              },
            ]
        : undefined,
  };

  const response = await apiClient("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapBackendOrderToFrontend(response);
}

export async function syncUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string,
  adminPin?: string,
  sentAt?: number,
  kitchenId?: string,
  itemId?: number | string,
  cancelReasonId?: string,
) {
  await apiClient(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: status.toLowerCase(),
      ...(sentAt ? { sentAt } : {}),
      ...(kitchenId ? { kitchenId } : {}),
      ...(typeof itemId === "number" ? { itemId } : {}),
      ...(adminPin ? { adminPin } : {}),
      ...(cancelReason ? { cancelReason } : {}),
      ...(cancelReasonId ? { cancelReasonId } : {}),
    }),
  });
}

export async function syncStartDelivery(orderId: string): Promise<void> {
  await apiClient(`/orders/${orderId}/start-delivery`, {
    method: "PATCH",
  });
}

export async function syncUpdateOrderItems(order: Order) {
  const response = await apiClient(`/orders/${order.id}/items`, {
    method: "PATCH",
    body: JSON.stringify({
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        size: i.size.toLowerCase() === "unico" ? "único" : i.size.toLowerCase(),
        quantity: i.quantity,
        extras: i.extras
          ? i.extras.map((e) => ({ name: e.name, price: e.price }))
          : [],
        note: i.note,
        kitchenModifiers: toKitchenModifierPayload(i.kitchenModifiers),
        giftQuantity: i.giftQuantity || 0,
        giftReason: i.giftReason,
        isSentToKitchen: !!i.isSentToKitchen,
        sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
        kitchenStatus: i.kitchenStatus,
        kitchenId: i.kitchenId,
        isCombo: Boolean(i.isCombo),
        comboSelections: i.comboSelections || undefined,
      })),
      total: order.total,
      subTotal: order.subTotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      promotionSource: order.promotionSource,
      promotionCode: order.promotionCode,
      cuponId: order.couponId,
      discountId: order.discountId,
      happyHourId: order.happyHourId,
      isSentToKitchen: order.isSentToKitchen,
    }),
  });
  return mapBackendOrderToFrontend(response);
}

export async function syncFinalizeOrder(order: Order): Promise<Order> {
  const paymentsPayload = order.payments?.length
    ? order.payments
    : order.paymentMethod === "MIXTO" && order.splitAmounts
      ? [
          { method: "EFECTIVO", amount: order.splitAmounts.efectivo || 0 },
          { method: "TARJETA", amount: order.splitAmounts.tarjeta || 0 },
          { method: "APP", amount: order.splitAmounts.app || 0 },
        ].filter((p) => p.amount > 0)
      : [
          {
            method: order.paymentMethod?.toUpperCase() || "EFECTIVO",
            amount: order.total,
          },
        ];

  const response = await apiClient(`/orders/${order.id}/finalize`, {
    method: "PATCH",
    body: JSON.stringify({
      payments: paymentsPayload,
      customerId: order.customerId,
      customerSnapshotName: order.customerName,
      customerPhone: order.customerPhone,
      orderType: order.orderType?.toLowerCase(),
      customerAddress: order.customerAddress,
      subTotal: order.subTotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      finalTotal: order.total,
      promotionCode: order.promotionCode,
      cuponId: order.couponId,
      promotionSource: order.promotionSource,
      discountId: order.discountId,
      happyHourId: order.happyHourId,
      certificateSerials: order.certificateSerials,
    }),
  });
  return mapBackendOrderToFrontend(response);
}

export async function syncUpdateTables(
  orderId: string,
  linkedTables: string[],
) {
  await apiClient(`/orders/${orderId}/tables`, {
    method: "PATCH",
    body: JSON.stringify({ tableIds: linkedTables }),
  });
}
