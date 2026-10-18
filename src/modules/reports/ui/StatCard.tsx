import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: string;
  iconColor?: string;
  iconBg?: string;
  masked?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  color,
  iconColor,
  iconBg,
  masked,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "none",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: 150,
        boxSizing: "border-box",
      }}
    >
      <CardContent
        sx={{
          p: "16px !important",
          flex: 1,
          display: "flex",
          position: "relative",
        }}
      >
        <Box width="100%" minWidth={0}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
              sx={{
                minHeight: 34,
                fontSize: { lg: "0.72rem", xl: "0.8rem" },
                lineHeight: 1.35,
                pr: icon ? 5 : 0,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mt: 1,
                mb: 0.5,
                color: color || "text.primary",
                whiteSpace: "nowrap",
                fontSize: { lg: "1.55rem", xl: "1.8rem" },
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {masked ? "********" : value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  width: "100%",
                  lineHeight: 1.45,
                  overflowWrap: "break-word",
                }}
              >
                {subtitle}
              </Typography>
            )}
          {icon && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: iconBg || "rgba(211, 47, 47, 0.1)",
                color: iconColor || color || "#d32f2f",
                "& .MuiSvgIcon-root": {
                  fontSize: "1.65rem",
                },
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

