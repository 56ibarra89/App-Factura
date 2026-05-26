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
import { LOGIN_SHADOWS, LOGIN_COLORS } from "../../theme/loginTheme";
import { SalesByTime } from "../../hooks/useSalesReport";

interface SalesChartProps {
  data: SalesByTime[];
  groupByDay?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, groupByDay }) => {
  return (
    <Box
      sx={{
        background: "white",
        borderRadius: 4,
        p: 3,
        boxShadow: LOGIN_SHADOWS.card,
        height: "100%",
        minHeight: 350,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" /> Evolución de Ventas {groupByDay ? 'por Día' : 'por Hora'}
      </Typography>
      
      <Box flex={1} width="100%">
        {data.length > 0 ? (
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
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: unknown) => [`C$${Number(value).toFixed(2)}`, "Ventas"]}
                labelStyle={{ color: LOGIN_COLORS.primaryDark, fontWeight: 'bold', marginBottom: 4 }}
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
