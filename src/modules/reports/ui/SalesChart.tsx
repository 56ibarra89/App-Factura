import React from "react";
import { Box, Typography } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { LOGIN_SHADOWS, LOGIN_COLORS } from "../../../shared/theme";
import type { SalesByTime } from "../hooks/useSalesReport";

interface SalesChartProps {
  data: SalesByTime[];
  groupByDay?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, groupByDay }) => {
  const hasSalesData = data.some(
    (dataPoint) => dataPoint.sales > 0 || dataPoint.ordersCount > 0,
  );

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 4,
        p: 3,
        boxShadow: LOGIN_SHADOWS.card,
        width: "100%",
        minHeight: 420,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" /> Evolución de Ventas {groupByDay ? 'por Día' : 'por Hora'}
      </Typography>
      
      <Box width="100%" height={{ xs: 300, sm: 330, md: 350 }}>
        {hasSalesData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#666" }} />
              <YAxis 
                width={80}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#666" }} 
                tickFormatter={(value) => `C$${value}`} 
              />
              <Tooltip
                cursor={{ fill: LOGIN_COLORS.numpadHoverShadow }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length > 0) {
                    const dataPoint = payload[0].payload as SalesByTime;
                    const ordersText = `${dataPoint.ordersCount} ${
                      dataPoint.ordersCount === 1
                        ? "orden atendida"
                        : "órdenes atendidas"
                    }`;

                    return (
                      <Box
                        sx={{
                          bgcolor: "background.paper",
                          p: 1.5,
                          borderRadius: 2,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="primary.main"
                        >
                          {String(label ?? dataPoint.time)}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ mt: 0.5 }}
                        >
                          C${dataPoint.sales.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ordersText}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="sales" 
                fill={LOGIN_COLORS.primary} 
                radius={[4, 4, 0, 0]} 
                barSize={40}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">No hay datos suficientes para graficar</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
