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
        borderRadius: 5,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        // Glassmorphism Base
        background: (theme) => theme.palette.mode === 'dark' 
          ? (disabled ? "rgba(255,255,255,0.05)" : "rgba(255, 255, 255, 0.1)")
          : (disabled ? "rgba(255,255,255,0.4)" : "rgba(255, 255, 255, 0.75)"),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: (theme) => theme.palette.mode === 'dark' 
          ? "1px solid rgba(255, 255, 255, 0.1)" 
          : "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        
        "&:hover": {
          transform: disabled ? "none" : "translateY(-8px) scale(1.02)",
          boxShadow: disabled ? "0 8px 32px rgba(0, 0, 0, 0.05)" : `0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px ${LOGIN_COLORS.primarySubtle}`,
          "& .widget-arrow": {
            transform: "translateX(4px)",
            color: LOGIN_COLORS.primary
          },
          "& .widget-icon-box": {
            background: `linear-gradient(135deg, ${LOGIN_COLORS.primaryDark} 0%, ${LOGIN_COLORS.primary} 100%)`,
            color: "white",
            transform: "scale(1.1) rotate(5deg)"
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
            borderRadius: '16px',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(211, 47, 47, 0.1)", // Color Subtle
            color: LOGIN_COLORS.primary,
            transition: "all 0.4s ease",
            mb: 2.5,
            boxShadow: `0 4px 12px ${LOGIN_COLORS.numpadHoverShadow}`
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
              transition: "all 0.3s ease",
              color: "text.secondary"
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>

      </CardContent>

      {/* Brillo decorativo superior derecho pseudo-glassmorphism */}
      {!disabled && (
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${LOGIN_COLORS.primarySubtle} 0%, rgba(255,255,255,0) 70%)`,
            borderRadius: '50%',
            opacity: 0.8,
            pointerEvents: 'none'
          }}
        />
      )}
    </Card>
  );
};
