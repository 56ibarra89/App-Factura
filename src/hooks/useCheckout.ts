// src/hooks/useCheckout.ts
import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { useOrderCommands } from "../context/OrderContext";
import { OrderType, PaymentMethod } from "../types/order.types";
import { useImpuestosConfig } from "./useImpuestosConfig";
import { calculateCartTotals, AppliedPromotion } from "../utils/cartTotals";

export function useCheckout(
  cart: CartItemType[],
  promotion: AppliedPromotion | null,
  discountAmount: number
) {
  const { taxes, isExonerated } = useImpuestosConfig();
  const { addOrder, updateOrderItems, finalizeOrder, markAsSentToKitchen } =
    useOrderCommands();

  const confirmFactura = useCallback(
    async (
      paymentMethod?: string,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string,
      driverId?: string,
      customerTendered?: number,
      packagingItems?: { name: string, price: number, quantity: number }[],
      deliveryCost?: number
    ) => {
      let extraCartItems: CartItemType[] = (packagingItems || []).map(pkg => ({
        name: `Empaque ${pkg.name}`,
        price: pkg.price,
        size: "único" as const,
        quantity: pkg.quantity,
        extras: [],
      }));

      if (deliveryCost && deliveryCost > 0) {
        extraCartItems.push({
          name: "Delivery",
          price: deliveryCost,
          size: "único" as const,
          quantity: 1,
          extras: [],
          note: "Cargo por transporte",
        });
      }

      const fullCart = [...cart, ...extraCartItems];

      const { total, subTotal, taxAmount } = calculateCartTotals(fullCart, taxes, isExonerated, promotion);

      // Crear y persistir la orden
      const invoiceNumber = await addOrder(
        fullCart,
        total,
        customerName,
        orderType,
        customerAddress,
        undefined,
        paymentMethod,
        splitAmounts,
        subTotal,
        taxAmount,
        discountAmount,
        promotion?.code,
        driverId,
        customerTendered
      );
      return invoiceNumber;
    },
    [cart, taxes, isExonerated, promotion, discountAmount, addOrder]
  );

  const saveTableOrder = useCallback(
    async (orderId?: string, tableId?: string) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated, promotion);

      if (orderId) {
        // Actualizar orden existente
        await updateOrderItems(orderId, cart, total, subTotal, taxAmount);
        return orderId;
      } else {
        // Crear nueva orden para la mesa
        const invoiceNumber = await addOrder(cart, total, undefined, "local", undefined, tableId, undefined, undefined, subTotal, taxAmount, discountAmount, promotion?.code);
        // Note: the order ID is created synchronously locally, we can get it from the last added order or just not rely on it immediately. But wait, addOrder creates it internally.
        // Let's just await it to ensure backend sync is done before proceeding.
        return invoiceNumber;
      }
    },
    [cart, taxes, isExonerated, promotion, discountAmount, addOrder, updateOrderItems]
  );

  const finalizeTableOrder = useCallback(
    async (
      orderId: string,
      paymentMethod: PaymentMethod,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string,
      packagingItems?: { name: string, price: number, quantity: number }[]
    ) => {
      const extraCartItems: CartItemType[] = (packagingItems || []).map(pkg => ({
        id: crypto.randomUUID(),
        name: `Empaque ${pkg.name}`,
        price: pkg.price,
        size: "único",
        quantity: pkg.quantity,
        extras: [],
      }));
      const fullCart = [...cart, ...extraCartItems];

      const { total, subTotal, taxAmount } = calculateCartTotals(fullCart, taxes, isExonerated, promotion);
      // Wait, updateOrderItems needs to be called to persist the fullCart
      await updateOrderItems(orderId, fullCart, total, subTotal, taxAmount);

      const invoiceNumber = await finalizeOrder(
        orderId,
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress,
        total,
        subTotal,
        taxAmount,
        discountAmount,
        promotion?.code
      );
      return invoiceNumber;
    },
    [cart, taxes, isExonerated, promotion, discountAmount, finalizeOrder]
  );

  return {
    confirmFactura,
    saveTableOrder,
    finalizeTableOrder,
    sendToKitchen: markAsSentToKitchen,
  };
}
