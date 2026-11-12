import React from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { LOGIN_COLORS } from "../../shared/theme";

interface AdminModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const AdminModuleCard: React.FC<AdminModuleCardProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false
}) => {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      sx={{
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: 196,
        display: "flex",
        flexDirection: "column",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "border-color 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",

        "&:hover": {
          borderColor: disabled ? "divider" : "primary.main",
          bgcolor: disabled ? "background.paper" : "action.hover",
          boxShadow: disabled ? "none" : "0 2px 8px rgba(0, 0, 0, 0.08)",
          "& .widget-arrow": {
            color: LOGIN_COLORS.primary
          },
          "& .widget-icon-box": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          }
        },
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1, height: '100%' }}>

        {/* Ícono superior flotante */}
        <Box
          className="widget-icon-box"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: LOGIN_COLORS.primarySubtle,
            color: LOGIN_COLORS.primary,
            transition: "background-color 120ms ease-out, color 120ms ease-out",
            mb: 2.5,
            boxShadow: "none"
          }}
        >
          {icon}
        </Box>

        {/* Textos */}
        <Box flexGrow={1}>
          <Typography variant="h6" fontWeight={800} color={disabled ? "text.secondary" : "text.primary"} sx={{ mb: 1, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </Typography>
        </Box>

        {/* Footer actions */}
        <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mt={2}>
          <IconButton
            className="widget-arrow"
            disabled={disabled}
            size="small"
            sx={{
              transition: "color 120ms ease-out",
              color: "text.secondary"
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>

      </CardContent>
    </Card>
  );
};

