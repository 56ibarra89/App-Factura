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
import { productGateway } from "../../catalog";

export interface TopProduct {
  name: string;
  quantity: number;
  totalRevenue: number;
  categoryId?: string;
  categoryName?: string;
}

export interface SalesByTime {
  time: string;
  sales: number;
  ordersCount: number;
}

export interface ChannelSalesSummary {
  type: "delivery" | "llevar" | "local";
  label: string;
  sales: number;
  ordersCount: number;
  percentage: number;
}

export interface SalesReportData {
  totalSales: number;
  cashSales: number;
  cardSales: number;
  appSales: number;
  paymentBreakdown: PaymentBreakdownRow[];
  totalOrders: number;
  totalDiscounts: number;
  discountedOrdersCount: number;
  topProducts: TopProduct[];
  salesByTime: SalesByTime[];
  channelsSummary: ChannelSalesSummary[];
}

export const useSalesReport = (startDate: Date, endDate: Date) => {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [orders, categories] = await Promise.all([
        ordersGateway.listByDateRange(startDate, endDate),
        productGateway.listCategories().catch(() => []),
      ]);
      const categoryNameById = new Map<string, string>();
      const categoryByProductId = new Map<
        string,
        { categoryId?: string; categoryName: string }
      >();
      categories.forEach((category) => {
        if (category.id) categoryNameById.set(category.id, category.label);
        category.items.forEach((product) => {
          if (!product.id) return;
          categoryByProductId.set(product.id, {
            categoryId: category.id,
            categoryName: category.label,
          });
        });
      });

      const salesOrders = orders.filter((order) => order.status === "paid");

      let totalSales = 0;
      let cashSales = 0;
      let cardSales = 0;
      let appSales = 0;
      let totalDiscounts = 0;
      let discountedOrdersCount = 0;
      const productMap = new Map<string, TopProduct>();
      const timeMap = new Map<
        string,
        { sales: number; ordersCount: number }
      >();
      const channelTotals: Record<
        ChannelSalesSummary["type"],
        { sales: number; ordersCount: number }
      > = {
        delivery: { sales: 0, ordersCount: 0 },
        llevar: { sales: 0, ordersCount: 0 },
        local: { sales: 0, ordersCount: 0 },
      };

      const daysDiff = differenceInDays(endDate, startDate);
      const groupByDay = daysDiff >= 1;

      salesOrders.forEach((order) => {
        totalSales += order.total;
        const discount = Number(order.discountAmount ?? 0);
        if (Number.isFinite(discount) && discount > 0) {
          totalDiscounts += discount;
          discountedOrdersCount += 1;
        }

        const channelType =
          order.orderType ?? (order.tableId ? "local" : "llevar");
        channelTotals[channelType].sales += order.total;
        channelTotals[channelType].ordersCount += 1;

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

        const currentTimeSummary = timeMap.get(timeKey) ?? {
          sales: 0,
          ordersCount: 0,
        };
        timeMap.set(timeKey, {
          sales: currentTimeSummary.sales + order.total,
          ordersCount: currentTimeSummary.ordersCount + 1,
        });

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
          const catalogCategory = item.productId
            ? categoryByProductId.get(item.productId)
            : undefined;
          const categoryId = item.categoryId ?? catalogCategory?.categoryId;
          const categoryName =
            (categoryId ? categoryNameById.get(categoryId) : undefined) ??
            catalogCategory?.categoryName ??
            "Otros";
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
          const productKey = item.productId ?? `${categoryId ?? "other"}:${item.name}`;
          if (productMap.has(productKey)) {
            const existing = productMap.get(productKey)!;
            existing.quantity += item.quantity;
            existing.totalRevenue += netRevenue;
          } else {
            productMap.set(productKey, {
              name: item.name,
              quantity: item.quantity,
              totalRevenue: netRevenue,
              categoryId,
              categoryName,
            });
          }
        });
      });

      // Ordenar productos por cantidad descendente
      const topProducts = Array.from(productMap.values()).sort(
        (a, b) => b.quantity - a.quantity
      );
      const channelLabels: Record<ChannelSalesSummary["type"], string> = {
        delivery: "Delivery",
        llevar: "Para Llevar",
        local: "Mesas / En Local",
      };
      const channelsSummary: ChannelSalesSummary[] = (
        ["delivery", "llevar", "local"] as const
      ).map((type) => ({
        type,
        label: channelLabels[type],
        sales: channelTotals[type].sales,
        ordersCount: channelTotals[type].ordersCount,
        percentage:
          totalSales > 0 ? (channelTotals[type].sales / totalSales) * 100 : 0,
      }));

      let salesByTime: SalesByTime[] = [];

      if (groupByDay) {
        const current = new Date(startDate);
        current.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        while (current <= end) {
          const key = format(current, "dd MMM", { locale: es });
          const timeSummary = timeMap.get(key) ?? {
            sales: 0,
            ordersCount: 0,
          };
          salesByTime.push({
            time: key,
            sales: timeSummary.sales,
            ordersCount: timeSummary.ordersCount,
          });
          current.setDate(current.getDate() + 1);
        }
      } else {
        salesByTime = Array.from({ length: 24 }, (_, hour) => {
          const time = `${hour.toString().padStart(2, "0")}:00`;
          const timeSummary = timeMap.get(time) ?? {
            sales: 0,
            ordersCount: 0,
          };
          return {
            time,
            sales: timeSummary.sales,
            ordersCount: timeSummary.ordersCount,
          };
        });
      }

      setData({
        totalSales,
        cashSales,
        cardSales,
        appSales,
        paymentBreakdown: aggregateOrderPayments(salesOrders),
        totalOrders: salesOrders.length,
        totalDiscounts,
        discountedOrdersCount,
        topProducts,
        salesByTime,
        channelsSummary,
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

