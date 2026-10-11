import { useState, useEffect, useCallback } from "react";
import {
  aggregateOrderPayments,
  getOrderPaymentDetails,
  isSupplementalOrderItem,
  ordersGateway,
  type PaymentBreakdownRow,
} from "../../orders";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";

export interface TopProduct {
  name: string;
  quantity: number;
  totalRevenue: number;
}

export interface SalesByTime {
  time: string;
  sales: number;
}

export interface SalesReportData {
  totalSales: number;
  cashSales: number;
  cardSales: number;
  appSales: number;
  paymentBreakdown: PaymentBreakdownRow[];
  totalOrders: number;
  topProducts: TopProduct[];
  salesByTime: SalesByTime[];
}

export const useSalesReport = (startDate: Date, endDate: Date) => {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orders = await ordersGateway.listByDateRange(startDate, endDate);

      const deliveredOrders = orders.filter(
        (o) => o.status === "paid" || (o.status === "delivered" && !o.tableId),
      );

      let totalSales = 0;
      let cashSales = 0;
      let cardSales = 0;
      let appSales = 0;
      const productMap = new Map<string, TopProduct>();
      const timeMap = new Map<string, number>();

      const daysDiff = differenceInDays(endDate, startDate);
      const groupByDay = daysDiff >= 1;

      deliveredOrders.forEach((order) => {
        totalSales += order.total;
        getOrderPaymentDetails(order).forEach((payment) => {
          const type = payment.methodType;
          if (type === "CASH" || (!type && payment.method === "EFECTIVO")) {
            cashSales += payment.amount;
          } else if (
            type === "CARD_POS" ||
            (!type && payment.method === "TARJETA")
          ) {
            cardSales += payment.amount;
          } else {
            appSales += payment.amount;
          }
        });

        const orderDate = new Date(order.timestamp);
        let timeKey = "";

        if (groupByDay) {
          timeKey = format(orderDate, "dd MMM", { locale: es });
        } else {
          const orderHour = orderDate.getHours();
          timeKey = `${orderHour.toString().padStart(2, '0')}:00`;
        }

        timeMap.set(timeKey, (timeMap.get(timeKey) || 0) + order.total);

        const reportableItems = order.items.filter(
          (item) => item.productId && !isSupplementalOrderItem(item),
        );
        const productGross = reportableItems.reduce(
          (sum, item) =>
            sum +
            item.price * Math.max(0, item.quantity - (item.giftQuantity ?? 0)),
          0,
        );

        reportableItems.forEach((item) => {
          const billableQuantity = Math.max(
            0,
            item.quantity - (item.giftQuantity ?? 0),
          );
          const grossRevenue = item.price * billableQuantity;
          const allocatedDiscount =
            productGross > 0
              ? (order.discountAmount ?? 0) * (grossRevenue / productGross)
              : 0;
          const netRevenue = Math.max(0, grossRevenue - allocatedDiscount);
          if (productMap.has(item.name)) {
            const existing = productMap.get(item.name)!;
            existing.quantity += item.quantity;
            existing.totalRevenue += netRevenue;
          } else {
            productMap.set(item.name, {
              name: item.name,
              quantity: item.quantity,
              totalRevenue: netRevenue,
            });
          }
        });
      });

      // Ordenar productos por cantidad descendente
      const topProducts = Array.from(productMap.values()).sort(
        (a, b) => b.quantity - a.quantity
      );

      let salesByTime: SalesByTime[] = [];

      if (groupByDay) {
        const current = new Date(startDate);
        current.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        while (current <= end) {
          const key = format(current, "dd MMM", { locale: es });
          salesByTime.push({
            time: key,
            sales: timeMap.get(key) || 0
          });
          current.setDate(current.getDate() + 1);
        }
      } else {
        salesByTime = Array.from(timeMap.entries())
          .map(([time, sales]) => ({ time, sales }))
          .sort((a, b) => a.time.localeCompare(b.time));
      }

      setData({
        totalSales,
        cashSales,
        cardSales,
        appSales,
        paymentBreakdown: aggregateOrderPayments(deliveredOrders),
        totalOrders: deliveredOrders.length,
        topProducts,
        salesByTime,
      });
    } catch (err) {
      console.error("Error cargando reporte:", err);
      setError("No se pudo cargar el reporte para las fechas seleccionadas.");
    } finally {
      setIsLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void fetchReportData();
  }, [fetchReportData]); // Refetch cuando cambian las fechas

  return { data, isLoading, error, refetch: fetchReportData };
};

