import { useState, useEffect, useCallback } from "react";
import { ordersGateway } from "../../orders";
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

      // Fetch de DB usando el rango de fechas proporcionado
      const orders = await ordersGateway.listByDateRange(startDate, endDate);

      // Filtrar a órdenes completadas ("paid")
      const deliveredOrders = orders.filter((o) => o.status === "paid");

      let totalSales = 0;
      const productMap = new Map<string, TopProduct>();
      const timeMap = new Map<string, number>();

      // Determinar si agrupamos por hora o por día
      // Si la diferencia entre inicio y fin es menor o igual a 1 día (aprox 24-48h), agrupamos por hora.
      // Math.abs para asegurar.
      const daysDiff = differenceInDays(endDate, startDate);
      const groupByDay = daysDiff >= 1;

      deliveredOrders.forEach((order) => {
        totalSales += order.total;

        // Agrupación de tiempo
        const orderDate = new Date(order.timestamp);
        let timeKey = "";
        
        if (groupByDay) {
          // Formato "dd MMM" (ej. "01 May")
          timeKey = format(orderDate, "dd MMM", { locale: es });
        } else {
          // Formato "HH:00"
          const orderHour = orderDate.getHours();
          timeKey = `${orderHour.toString().padStart(2, '0')}:00`;
        }
        
        timeMap.set(timeKey, (timeMap.get(timeKey) || 0) + order.total);

        // Agrupar productos
        order.items.forEach((item) => {
          if (productMap.has(item.name)) {
            const existing = productMap.get(item.name)!;
            existing.quantity += item.quantity;
            existing.totalRevenue += item.price * item.quantity;
          } else {
            productMap.set(item.name, {
              name: item.name,
              quantity: item.quantity,
              totalRevenue: item.price * item.quantity,
            });
          }
        });
      });

      // Ordenar productos por cantidad descendente
      const topProducts = Array.from(productMap.values()).sort(
        (a, b) => b.quantity - a.quantity
      );

      // Preparar ventas por tiempo y ordenar cronológicamente
      // Si es por día, necesitamos un orden real, pero el timeKey es un string como "01 May".
      // Lo más seguro es crear un arreglo desde el map, o confiar en que si iteramos desde inicio a fin rellenamos los vacíos.
      // Para simplificar, ordenamos alfabéticamente si es hora, o por fecha real si es día.
      let salesByTime: SalesByTime[] = [];
      
      if (groupByDay) {
        // Para ordenar por día correctamente, iteramos sobre los días del rango para incluir días sin ventas también
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
        // Por hora
        salesByTime = Array.from(timeMap.entries())
          .map(([time, sales]) => ({ time, sales }))
          .sort((a, b) => a.time.localeCompare(b.time));
      }

      setData({
        totalSales,
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
