import { Order, OrderStatus, OrderType, PaymentMethod, KitchenStatus } from "../../types/order.types";
import { apiClient } from "../../config/apiClient";

export function mapBackendOrderToFrontend(backendOrder: any): Order {
  return {
    id: backendOrder.id,
    items: backendOrder.items.map((i: any) => ({
      id: Math.random(), // Temporary ID for frontend list rendering
      name: i.name,
      price: Number(i.price),
      size: i.size.toLowerCase(),
      quantity: Number(i.quantity),
      extras: i.extras.map((e: any) => ({ name: e.name, price: Number(e.price) })),
      note: i.note,
      giftQuantity: i.giftQuantity,
      isSentToKitchen: i.isSentToKitchen,
      sentAt: i.sentAt ? new Date(i.sentAt).getTime() : undefined,
      kitchenStatus: i.kitchenStatus ? (i.kitchenStatus.toLowerCase() as KitchenStatus) : undefined,
    })),
    subTotal: backendOrder.subTotal !== null ? Number(backendOrder.subTotal) : undefined,
    discountAmount: backendOrder.discountAmount !== null ? Number(backendOrder.discountAmount) : undefined,
    taxAmount: backendOrder.taxAmount !== null ? Number(backendOrder.taxAmount) : undefined,
    total: Number(backendOrder.total),
    status: backendOrder.status.toLowerCase() as OrderStatus,
    timestamp: new Date(backendOrder.timestamp),
    customerName: backendOrder.customerSnapshotName || undefined,
    orderType: backendOrder.orderType ? (backendOrder.orderType.toLowerCase() as OrderType) : undefined,
    customerAddress: backendOrder.customerAddress || undefined,
    tableId: backendOrder.linkedTables && backendOrder.linkedTables.length > 0 ? backendOrder.linkedTables[0] : undefined,
    linkedTables: backendOrder.linkedTables,
    paymentMethod: backendOrder.payments && backendOrder.payments.length > 0 ? (backendOrder.payments[0].method.toLowerCase() as PaymentMethod) : undefined,
    cashierName: backendOrder.cashierSnapshotName || undefined,
    isSentToKitchen: backendOrder.isSentToKitchen,
  };
}

export async function fetchOrdersFromBackend(): Promise<Order[]> {
  const data = await apiClient('/orders?scope=todayOrActive');
  return data.map(mapBackendOrderToFrontend);
}

export async function syncAddOrderToBackend(order: Order): Promise<void> {
  const payload = {
    id: order.id,
    items: order.items.map(i => ({
      name: i.name,
      price: i.price,
      size: i.size.toUpperCase(),
      quantity: i.quantity,
      extras: i.extras ? i.extras.map(e => ({ name: e.name, price: e.price })) : [],
      note: i.note,
      giftQuantity: i.giftQuantity || 0,
      isSentToKitchen: !!i.isSentToKitchen,
    })),
    total: order.total,
    subTotal: order.subTotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    status: order.status.toUpperCase(),
    timestamp: order.timestamp.toISOString(),
    customerSnapshotName: order.customerName,
    orderType: order.orderType ? order.orderType.toUpperCase() : undefined,
    customerAddress: order.customerAddress,
    cashierSnapshotName: order.cashierName,
    isSentToKitchen: order.isSentToKitchen,
    linkedTables: order.linkedTables && order.linkedTables.length > 0 ? order.linkedTables : (order.tableId ? [order.tableId] : undefined),
    payments: order.paymentMethod ? [{
      method: order.paymentMethod.toUpperCase(),
      amount: order.total,
    }] : undefined,
  };

  await apiClient('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function syncUpdateOrderStatus(orderId: string, status: OrderStatus) {
  await apiClient(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: status.toUpperCase(),
      isSentToKitchen: status === "preparing" || status === "ready" || status === "delivered" ? true : undefined
    }),
  });
}

export async function syncUpdateOrderItems(order: Order) {
  await apiClient(`/orders/${order.id}/items`, {
    method: 'PATCH',
    body: JSON.stringify({
      items: order.items.map(i => ({
        name: i.name,
        price: i.price,
        size: i.size.toUpperCase(),
        quantity: i.quantity,
        extras: i.extras ? i.extras.map(e => ({ name: e.name, price: e.price })) : [],
        note: i.note,
        giftQuantity: i.giftQuantity || 0,
        isSentToKitchen: !!i.isSentToKitchen,
      })),
      total: order.total,
      subTotal: order.subTotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      isSentToKitchen: order.isSentToKitchen,
      status: order.status.toUpperCase(),
    }),
  });
}

export async function syncFinalizeOrder(order: Order) {
  await apiClient(`/orders/${order.id}/finalize`, {
    method: 'PATCH',
    body: JSON.stringify({
      paymentMethod: order.paymentMethod?.toUpperCase(),
      customerSnapshotName: order.customerName,
      orderType: order.orderType?.toUpperCase(),
      customerAddress: order.customerAddress,
      subTotal: order.subTotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      status: 'PAID'
    }),
  });
}

export async function syncUpdateTables(orderId: string, linkedTables: string[]) {
  await apiClient(`/orders/${orderId}/tables`, {
    method: 'PATCH',
    body: JSON.stringify({ tableIds: linkedTables }),
  });
}
