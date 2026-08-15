import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import GridViewIcon from "@mui/icons-material/GridView";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import { BackButton } from "../../../../shared/ui";
import type { Kitchen } from "../../../kitchens";

interface KdsHeaderProps {
  kitchens: Kitchen[];
  selectedKitchenId: string;
  onKitchenChange: (kitchenId: string) => void;
  showAllKitchensTab?: boolean;
  activeCount: number;
  criticalCount: number;
  viewMode: "kanban" | "grid";
  onViewModeChange: (mode: "kanban" | "grid") => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({
  kitchens,
  selectedKitchenId,
  onKitchenChange,
  showAllKitchensTab = true,
  activeCount,
  criticalCount,
  viewMode,
  onViewModeChange,
  isMuted,
  onToggleMute,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("No se pudo activar pantalla completa:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const activeKitchens = kitchens.filter((k) => k.isActive);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        p: 2,
        borderRadius: 3,
        mb: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        gap={2}
      >
        {/* Título & Botón volver */}
        <Stack direction="row" spacing={2} alignItems="center">
          <BackButton to="/home" />
          <SoupKitchenIcon color="primary" sx={{ fontSize: "2.2rem" }} />
          <Box>
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: "-0.5px" }}>
              Pantalla de Cocina
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {activeCount} órdenes activas
              </Typography>
              {criticalCount > 0 && (
                <Badge
                  badgeContent={`${criticalCount} críticas`}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "error.main",
                      color: "error.contrastText",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      position: "relative",
                      transform: "none",
                    },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Acciones principales */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* Selector de vista Grid vs Kanban */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && onViewModeChange(val)}
            size="small"
            sx={{
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              "& .MuiToggleButton-root": {
                color: "text.primary",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            <ToggleButton value="kanban">
              <Tooltip title="Vista Kanban (Columnas)">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ViewColumnIcon fontSize="small" />
                  <Typography variant="caption" fontWeight="700" sx={{ display: { xs: "none", sm: "inline" } }}>
                    Kanban
                  </Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="grid">
              <Tooltip title="Vista Cuadrícula (Compacta)">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <GridViewIcon fontSize="small" />
                  <Typography variant="caption" fontWeight="700" sx={{ display: { xs: "none", sm: "inline" } }}>
                    Cuadrícula
                  </Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Silenciar / Activar Sonido */}
          <Tooltip title={isMuted ? "Activar alertas sonoras" : "Silenciar alertas sonoras"}>
            <IconButton
              onClick={onToggleMute}
              sx={{
                bgcolor: isMuted ? "rgba(211,47,47,0.12)" : "rgba(46,125,50,0.12)",
                color: isMuted ? "error.main" : "success.main",
                border: `1px solid ${isMuted ? "rgba(211,47,47,0.3)" : "rgba(46,125,50,0.3)"}`,
                p: 1.2,
              }}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
          </Tooltip>

          {/* Pantalla Completa */}
          <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                bgcolor: "action.hover",
                color: "text.primary",
                border: "1px solid",
                borderColor: "divider",
                p: 1.2,
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Tabs de Filtro de Cocinas */}
      {(showAllKitchensTab || activeKitchens.length > 0) && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
          <Tabs
            value={selectedKitchenId}
            onChange={(_, val) => onKitchenChange(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                color: "text.secondary",
                fontWeight: 700,
                fontSize: "0.95rem",
                "&.Mui-selected": {
                  color: "primary.main",
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "primary.main",
                height: 3,
              },
            }}
          >
            {showAllKitchensTab && (
              <Tab label="Todas las áreas de cocina" value="" />
            )}
            {activeKitchens.map((k) => (
              <Tab key={k.id} label={k.name} value={k.id} />
            ))}
          </Tabs>
        </Box>
      )}
    </Box>
  );
};
