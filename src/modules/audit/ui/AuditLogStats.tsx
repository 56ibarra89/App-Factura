import React from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SecurityIcon from "@mui/icons-material/Security";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import type { AuditStats } from "../model/audit.types";

interface AuditLogStatsProps {
  stats: AuditStats;
}

export const AuditLogStats: React.FC<AuditLogStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Total de Eventos",
      value: stats.total,
      subtitle: "Registros en el periodo",
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 28, color: "#1976d2" }} />,
      bgColor: "rgba(25, 118, 210, 0.08)",
      borderColor: "rgba(25, 118, 210, 0.2)",
    },
    {
      title: "Alertas y Errores",
      value: stats.errors + stats.warnings,
      subtitle: `${stats.errors} errores críticos • ${stats.warnings} avisos`,
      icon: <ErrorOutlineIcon sx={{ fontSize: 28, color: stats.errors > 0 ? "#d32f2f" : "#ed6c02" }} />,
      bgColor: stats.errors > 0 ? "rgba(211, 47, 47, 0.08)" : "rgba(237, 108, 2, 0.08)",
      borderColor: stats.errors > 0 ? "rgba(211, 47, 47, 0.25)" : "rgba(237, 108, 2, 0.25)",
      badge: stats.errors > 0 ? `${stats.errors} ERROR` : undefined,
    },
    {
      title: "Accesos y Sesiones",
      value: stats.logins,
      subtitle: "Inicios de sesión (PIN/Pass)",
      icon: <SecurityIcon sx={{ fontSize: 28, color: "#0288d1" }} />,
      bgColor: "rgba(2, 136, 209, 0.08)",
      borderColor: "rgba(2, 136, 209, 0.2)",
    },
    {
      title: "Operaciones Clave",
      value: stats.operations,
      subtitle: "Facturas y configuraciones",
      icon: <ReceiptLongIcon sx={{ fontSize: 28, color: "#2e7d32" }} />,
      bgColor: "rgba(46, 125, 50, 0.08)",
      borderColor: "rgba(46, 125, 50, 0.2)",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: card.borderColor,
              bgcolor: "background.paper",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: "text.primary" }}>
                  {card.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2.5,
                  bgcolor: card.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {card.subtitle}
              </Typography>
              {card.badge && (
                <Chip
                  label={card.badge}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
