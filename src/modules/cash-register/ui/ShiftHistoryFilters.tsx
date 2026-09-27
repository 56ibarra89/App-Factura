import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ROLE_LABELS } from "../../auth";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  modalidadFilter: string;
  onModalidadChange: (value: string) => void;
  cuadreFilter: string;
  onCuadreChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  totalFiltered: number;
  totalSales: number;
  netDifference: number;
  hasClosedShifts: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ShiftHistoryFilters({
  searchTerm,
  onSearchChange,
  modalidadFilter,
  onModalidadChange,
  cuadreFilter,
  onCuadreChange,
  roleFilter,
  onRoleChange,
  totalFiltered,
  totalSales,
  netDifference,
  hasClosedShifts,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Campo de Búsqueda */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar colaborador, caja, notas, autorizador..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Grid>

        {/* Filtro por Modalidad (Relevo vs Cierre Final) */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="modalidad-filter-label">
              Modalidad de Cierre
            </InputLabel>
            <Select
              labelId="modalidad-filter-label"
              value={modalidadFilter}
              label="Modalidad de Cierre"
              onChange={(e) => onModalidadChange(e.target.value)}
            >
              <MenuItem value="all">Todas las modalidades</MenuItem>
              <MenuItem value="HANDOVER">
                <Stack direction="row" spacing={1} alignItems="center">
                  <SyncAltIcon sx={{ color: "#0288d1", fontSize: 18 }} />
                  <Typography variant="body2">⇄ Relevo de Turno</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="END_OF_DAY">
                <Stack direction="row" spacing={1} alignItems="center">
                  <NightlightRoundIcon sx={{ color: "#ed6c02", fontSize: 18 }} />
                  <Typography variant="body2">🌙 Cierre Final</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="OPEN">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon sx={{ color: "#2e7d32", fontSize: 18 }} />
                  <Typography variant="body2">🟢 En Curso (Abiertos)</Typography>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Filtro por Estado de Cuadre */}
        <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="cuadre-filter-label">Estado de Cuadre</InputLabel>
            <Select
              labelId="cuadre-filter-label"
              value={cuadreFilter}
              label="Estado de Cuadre"
              onChange={(e) => onCuadreChange(e.target.value)}
            >
              <MenuItem value="all">Todos los cuadres</MenuItem>
              <MenuItem value="balanced">Exactos (C$0.00)</MenuItem>
              <MenuItem value="discrepant">Con Descuadre</MenuItem>
              <MenuItem value="authorized">🛡️ Autorizados con PIN</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Filtro por Rol */}
        <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="role-filter-label">Rol</InputLabel>
            <Select
              labelId="role-filter-label"
              value={roleFilter}
              label="Rol"
              onChange={(e) => onRoleChange(e.target.value)}
            >
              <MenuItem value="all">Todos los roles</MenuItem>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider />

      {/* Barra de Totales y Contador */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            label={`${totalFiltered} ${totalFiltered === 1 ? "turno" : "turnos"}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: "bold" }}
          />

          <Typography variant="body2" color="text.secondary">
            Ventas:{" "}
            <Box component="span" fontWeight="bold" color="text.primary">
              C${totalSales.toFixed(2)}
            </Box>
          </Typography>

          {hasClosedShifts && (
            <Typography variant="body2" color="text.secondary">
              • Balance Descuadres:{" "}
              <Box
                component="span"
                fontWeight="bold"
                color={
                  Math.abs(netDifference) < 0.01
                    ? "success.main"
                    : netDifference > 0
                      ? "info.main"
                      : "error.main"
                }
              >
                {Math.abs(netDifference) < 0.01
                  ? "C$0.00 (Exacto)"
                  : `${netDifference > 0 ? "+" : ""}C$${netDifference.toFixed(2)}`}
              </Box>
            </Typography>
          )}
        </Stack>

        {hasActiveFilters && (
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={onClearFilters}
            startIcon={<ClearIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>
    </Paper>
  );
}
