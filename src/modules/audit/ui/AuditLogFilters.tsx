import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Paper,
  Button,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import ClearIcon from "@mui/icons-material/Clear";
import type { AuditFiltersState } from "../model/audit.types";

interface AuditLogFiltersProps {
  filters: AuditFiltersState;
  onFilterChange: <K extends keyof AuditFiltersState>(key: K, value: AuditFiltersState[K]) => void;
  onResetFilters: () => void;
  onDatePreset?: (preset: "today" | "yesterday" | "7days" | "month" | "all") => void;
  availableUsers: string[];
  totalFiltered: number;
  totalLogs: number;
}

const ROLES = [
  { value: "ALL", label: "Todos los roles" },
  { value: "ADMIN", label: "Administrador" },
  { value: "CAJERO", label: "Cajero" },
  { value: "CAJERO_PRINCIPAL", label: "Cajero Principal" },
  { value: "MESERO", label: "Mesero" },
  { value: "COCINERO", label: "Cocinero" },
  { value: "MOTORIZADO", label: "Motorizado" },
  { value: "DESPACHADOR", label: "Despachador" },
];

const LEVELS = [
  { value: "ALL", label: "Todos los niveles" },
  { value: "INFO", label: "Info (Normal)" },
  { value: "WARN", label: "Advertencia (Warn)" },
  { value: "ERROR", label: "Error Crítico" },
];

const CATEGORIES = [
  { value: "ALL", label: "Todas las categorías" },
  { value: "Seguridad", label: "Seguridad / Accesos" },
  { value: "Facturación", label: "Facturación y Cobro" },
  { value: "Catálogo", label: "Catálogo de Productos" },
  { value: "Mesas", label: "Mesas y Reservas" },
  { value: "Usuarios", label: "Gestión de Usuarios" },
  { value: "Configuración", label: "Configuración Sistema" },
  { value: "Sistema", label: "Sistema / Crashes" },
];

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onDatePreset,
  availableUsers,
  totalFiltered,
  totalLogs,
}) => {
  const isFiltered =
    Boolean(filters.search.trim()) ||
    filters.user !== "ALL" ||
    filters.role !== "ALL" ||
    filters.level !== "ALL" ||
    filters.category !== "ALL" ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      {/* Primera fila: Búsqueda, Rol, Usuario, Nivel */}
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        {/* Buscador General */}
        <Box flex={{ xs: "1 1 100%", md: "1 1 calc(32% - 16px)" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por usuario, acción, detalle o error..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onFilterChange("search", "")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {/* Selector de Rol */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(22% - 16px)" }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Rol de Usuario"
            value={filters.role}
            onChange={(e) => onFilterChange("role", e.target.value)}
          >
            {ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Selector de Usuario */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(22% - 16px)" }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Usuario"
            value={filters.user}
            onChange={(e) => onFilterChange("user", e.target.value)}
          >
            <MenuItem value="ALL">Todos los usuarios</MenuItem>
            {availableUsers.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Selector de Nivel */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(20% - 16px)" }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Nivel de Severidad"
            value={filters.level}
            onChange={(e) => onFilterChange("level", e.target.value)}
          >
            {LEVELS.map((lvl) => (
              <MenuItem key={lvl.value} value={lvl.value}>
                {lvl.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Segunda fila: Categoría, Fechas y Botón Limpiar */}
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mt: 2 }}>
        {/* Selector de Categoría */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(22% - 16px)" }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Categoría"
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Fecha Desde */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(20% - 16px)" }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Desde"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Fecha Hasta */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(20% - 16px)" }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Hasta"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Botón de limpiar filtros */}
        <Box flex={{ xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(16% - 16px)" }}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={!isFiltered}
            onClick={onResetFilters}
            startIcon={<FilterAltOffIcon />}
            sx={{
              height: 40,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Limpiar Filtros
          </Button>
        </Box>

        {/* Contador Informativo */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          flexGrow={1}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Mostrando <b>{totalFiltered}</b> de <b>{totalLogs}</b> eventos
          </Typography>
        </Box>
      </Box>

      {/* Tercera fila: Atajos Rápidos de Fecha */}
      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Atajos de Fecha:
        </Typography>
        <Chip
          label="Hoy"
          size="small"
          clickable
          variant="outlined"
          color="primary"
          onClick={() => onDatePreset?.("today")}
          sx={{ fontWeight: 700, fontSize: "0.72rem" }}
        />
        <Chip
          label="Ayer"
          size="small"
          clickable
          variant="outlined"
          onClick={() => onDatePreset?.("yesterday")}
          sx={{ fontWeight: 600, fontSize: "0.72rem" }}
        />
        <Chip
          label="Últimos 7 días"
          size="small"
          clickable
          variant="outlined"
          onClick={() => onDatePreset?.("7days")}
          sx={{ fontWeight: 600, fontSize: "0.72rem" }}
        />
        <Chip
          label="Este Mes"
          size="small"
          clickable
          variant="outlined"
          onClick={() => onDatePreset?.("month")}
          sx={{ fontWeight: 600, fontSize: "0.72rem" }}
        />
        <Chip
          label="Todas las fechas"
          size="small"
          clickable
          variant="outlined"
          onClick={() => onDatePreset?.("all")}
          sx={{ fontWeight: 600, fontSize: "0.72rem" }}
        />
      </Box>
    </Paper>
  );
};
