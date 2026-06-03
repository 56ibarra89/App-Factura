import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { LOGIN_SHADOWS, LOGIN_GRADIENTS } from "../../theme/loginTheme";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: string;
  masked?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, masked }) => {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: LOGIN_SHADOWS.card,
        bgcolor: 'background.default',
        display: "flex",
        flexDirection: "column",
        p: 2,
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ pb: "16px !important" }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 0.5, color: "text.primary" }}>
              {masked ? "********" : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211, 47, 47, 0.1)", // Color subtle rojo
                color: "#d32f2f",
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
