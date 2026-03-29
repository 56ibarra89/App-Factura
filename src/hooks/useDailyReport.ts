import { useState, useEffect } from "react";
import { getOrdersByDateRange } from "../services/db";

export interface TopProduct {
  name: string;
  quantity: number;
  totalRevenue: number;
}

export interface SalesByHour {
  time: string;
  sales: number;
}

export interface DailyReportData {
  totalSales: number;
  totalOrders: number;
  topProducts: TopProduct[];
  salesByHour: SalesByHour[];
}

export const useDailyReport = () => {
  const [data, setData] = useState<DailyReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Obtener inicio y fin del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // 2. Fetch de DB
      const orders = await getOrdersByDateRange(startOfDay, endOfDay);

      // 3. Filtrar a solo órdenes "delivered"
      const deliveredOrders = orders.filter((o) => o.status === "delivered");

      // 4. Calcular métricas principales
      let totalSales = 0;
      const productMap = new Map<string, TopProduct>();
      
      // Inicializar horas del día para gráfico (ej. desde 8 AM a 22 PM, o simplemente agrupar las horas con ventas)
      // Para un día en marcha, es mejor agrupar en un mapa
      const hourMap = new Map<string, number>();

      deliveredOrders.forEach((order) => {
        totalSales += order.total;

        // Extraer la hora
        const orderHour = new Date(order.timestamp).getHours();
        const hourKey = `${orderHour.toString().padStart(2, '0')}:00`;
        hourMap.set(hourKey, (hourMap.get(hourKey) || 0) + order.total);

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

      // 5. Ordenar productos por cantidad descendente
      const topProducts = Array.from(productMap.values()).sort(
        (a, b) => b.quantity - a.quantity
      );

      // 6. Preparar ventas por hora y ordenar por hora
      const salesByHour: SalesByHour[] = Array.from(hourMap.entries())
        .map(([time, sales]) => ({ time, sales }))
        .sort((a, b) => a.time.localeCompare(b.time));

      setData({
        totalSales,
        totalOrders: deliveredOrders.length,
        topProducts,
        salesByHour,
      });
    } catch (err) {
      console.error("Error cargando reporte diario:", err);
      setError("No se pudo cargar el reporte del día.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
  }, []);

  return { data, isLoading, error, refetch: fetchDailyData };
};
