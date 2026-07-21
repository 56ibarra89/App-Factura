import { Order, OrderStatus, OrderType, PaymentMethod, KitchenStatus } from "../../types/order.types";
import { apiClient } from "../../config/apiClient";

interface BackendExtra {
  name: string;
  price: number | string;
}

interface BackendItem {
  id?: string | number;
  name: string;
  price: number | string;
  size: string;
  quantity: number | string;
  extras: BackendExtra[];
  note?: string;
  giftQuantity?: number;
  isSentToKitchen?: boolean;
  sentAt?: string | Date;
  kitchenStatus?: string;
  kitchenId?: string;
}

interface BackendOrder {
  id: string;
  items: BackendItem[];
  subTotal?: number | string | null;
  discountAmount?: number | string | null;
  taxAmount?: number | string | null;
  total: number | string;
  customerTendered?: number | string | null;
  deliveryChange?: number | string | null;
  status: string;
  timestamp: string | Date;
  customerSnapshotName?: string;
  orderType?: string;
  customerAddress?: string;
  driverId?: string;
  linkedTables?: string[];
  payments?: { method: string; amount: number | string; cashierId?: string; cashierSnapshotName?: string }[];
  cashierSnapshotName?: string;
  isSentToKitchen?: boolean;
  invoice?: { invoiceNumber: string };
  invoiceNumber?: string;
}

function mapBackendOrderToFrontend(backendOrder: BackendOrder): Order {
  return {
    id: backendOrder.id,
    items: backendOrder.items.map((i: BackendItem) => ({
      id: i.id ? Number(i.id) : undefined,
      name: i.name,
      price: Number(i.price),
      size: i.size.toLowerCase(),
      quantity: Number(i.quantity),
      extras: i.extras.map((e: BackendExtra) => ({ name: e.name, price: Number(e.price) })),
      note: i.note,
      giftQuantity: i.giftQuantity,
      isSentToKitchen: i.isSentToKitchen,
      sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
      kitchenStatus: i.kitchenStatus ? (i.kitchenStatus.toLowerCase() as KitchenStatus) : undefined,
      kitchenId: i.kitchenId,
    })),
    subTotal: backendOrder.subTotal !== null ? Number(backendOrder.subTotal) : undefined,
    discountAmount: backendOrder.discountAmount !== null ? Number(backendOrder.discountAmount) : undefined,
    taxAmount: backendOrder.taxAmount !== null ? Number(backendOrder.taxAmount) : undefined,
    total: Number(backendOrder.total),
    customerTendered: backendOrder.customerTendered !== null && backendOrder.customerTendered !== undefined ? Number(backendOrder.customerTendered) : undefined,
    deliveryChange: backendOrder.deliveryChange !== null && backendOrder.deliveryChange !== undefined ? Number(backendOrder.deliveryChange) : undefined,
    status: backendOrder.status.toLowerCase() as OrderStatus,
    timestamp: new Date(backendOrder.timestamp),
    customerName: backendOrder.customerSnapshotName || undefined,
    orderType: backendOrder.orderType ? (backendOrder.orderType.toLowerCase() as OrderType) : undefined,
    customerAddress: backendOrder.customerAddress || undefined,
    driverId: backendOrder.driverId || undefined,
    tableId: backendOrder.linkedTables && backendOrder.linkedTables.length > 0 ? backendOrder.linkedTables[0] : undefined,
    linkedTables: backendOrder.linkedTables,
    paymentMethod: backendOrder.payments && backendOrder.payments.length > 0 ? (backendOrder.payments[0].method.toLowerCase() as PaymentMethod) : undefined,
    cashierName: backendOrder.cashierSnapshotName || undefined,
    isSentToKitchen: backendOrder.isSentToKitchen,
    invoiceNumber: backendOrder.invoice?.invoiceNumber || backendOrder.invoiceNumber || undefined,
  };
}

export async function fetchOrdersFromBackend(): Promise<Order[]> {
  const data = await apiClient('/orders?scope=todayOrActive');
  return data.map(mapBackendOrderToFrontend);
}

export async function fetchOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
  const start = startDate.toISOString();
  const end = endDate.toISOString();
  const data = await apiClient(`/orders?startDate=${start}&endDate=${end}`);
  return data.map(mapBackendOrderToFrontend);
}

export async function syncAddOrderToBackend(order: Order): Promise<Order> {
  const payload = {
    id: order.id,
    items: order.items.map(i => ({
      name: i.name,
      price: i.price,
      size: i.size.toLowerCase() === 'unico' ? 'único' : i.size.toLowerCase(),
      quantity: i.quantity,
      extras: i.extras ? i.extras.map(e => ({ name: e.name, price: e.price })) : [],
      note: i.note,
      giftQuantity: i.giftQuantity || 0,
      isSentToKitchen: !!i.isSentToKitchen,
      sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
      kitchenStatus: i.kitchenStatus,
      kitchenId: i.kitchenId,
    })),
    total: order.total,
    subTotal: order.subTotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    status: order.status.toLowerCase(),
    timestamp: order.timestamp.toISOString(),
    customerSnapshotName: order.customerName,
    orderType: order.orderType ? order.orderType.toLowerCase() : undefined,
    customerAddress: order.customerAddress,
    driverId: order.driverId,
    customerTendered: order.customerTendered,
    deliveryChange: order.deliveryChange,
    cashierSnapshotName: order.cashierName,
    isSentToKitchen: order.isSentToKitchen,
    linkedTables: order.linkedTables && order.linkedTables.length > 0 ? order.linkedTables : (order.tableId ? [order.tableId] : undefined),
    payments: order.paymentMethod ? 
      (order.paymentMethod === 'MIXTO' && order.splitAmounts ? [
        { method: 'EFECTIVO', amount: order.splitAmounts.efectivo },
        { method: 'TARJETA', amount: order.splitAmounts.tarjeta }
      ].filter(p => p.amount > 0) : [{
        method: order.paymentMethod.toUpperCase(),
        amount: order.total,
      }]) : undefined,
  };

  const response = await apiClient('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapBackendOrderToFrontend(response);
}

export async function syncUpdateOrderStatus(orderId: string, status: OrderStatus, cancelReason?: string, adminPin?: string, sentAt?: number, kitchenId?: string, itemId?: number | string) {
  await apiClient(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: status.toLowerCase(),
      ...(sentAt ? { sentAt } : {}),
      ...(kitchenId ? { kitchenId } : {}),
      ...(typeof itemId === 'number' ? { itemId } : {}),
      ...(adminPin ? { adminPin } : {}),
      ...(cancelReason ? { cancelReason } : {}),
    }),
  });
}

export async function syncUpdateOrderItems(order: Order) {
  const response = await apiClient(`/orders/${order.id}/items`, {
    method: 'PATCH',
    body: JSON.stringify({
      items: order.items.map(i => ({
        name: i.name,
        price: i.price,
        size: i.size.toLowerCase() === 'unico' ? 'único' : i.size.toLowerCase(),
        quantity: i.quantity,
        extras: i.extras ? i.extras.map(e => ({ name: e.name, price: e.price })) : [],
        note: i.note,
        giftQuantity: i.giftQuantity || 0,
        isSentToKitchen: !!i.isSentToKitchen,
        sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
        kitchenStatus: i.kitchenStatus,
        kitchenId: i.kitchenId,
      })),
      total: order.total,
      subTotal: order.subTotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      isSentToKitchen: order.isSentToKitchen,
    }),
  });
  return mapBackendOrderToFrontend(response);
}

export async function syncFinalizeOrder(order: Order): Promise<Order> {
  const paymentsPayload = order.paymentMethod === 'MIXTO' && order.splitAmounts ? [
    { method: 'EFECTIVO', amount: order.splitAmounts.efectivo },
    { method: 'TARJETA', amount: order.splitAmounts.tarjeta }
  ].filter(p => p.amount > 0) : [{
    method: order.paymentMethod?.toUpperCase() || 'EFECTIVO',
    amount: order.total
  }];

  const response = await apiClient(`/orders/${order.id}/finalize`, {
    method: 'PATCH',
    body: JSON.stringify({
      payments: paymentsPayload,
      customerSnapshotName: order.customerName,
      orderType: order.orderType?.toLowerCase(),
      customerAddress: order.customerAddress,
      subTotal: order.subTotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      finalTotal: order.total,
      status: order.status
    }),
  });
  return mapBackendOrderToFrontend(response);
}

export async function syncUpdateTables(orderId: string, linkedTables: string[]) {
  await apiClient(`/orders/${orderId}/tables`, {
    method: 'PATCH',
    body: JSON.stringify({ tableIds: linkedTables }),
  });
}
