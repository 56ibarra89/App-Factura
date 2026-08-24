import { useCallback, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";
import { useShiftHistory } from "../hooks/useShiftHistory";
import { ROLE_LABELS, type UserRole } from "../../auth";
import ShiftTicketPrint from "../ui/ShiftTicketPrint";
import type { Shift } from "../model/cash-register.types";

const ROLE_COLORS: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  admin: {
    bg: "rgba(156, 39, 176, 0.12)",
    color: "#ab47bc",
    border: "#ab47bc",
  },
  cajero: {
    bg: "rgba(25, 118, 210, 0.12)",
    color: "#1976d2",
    border: "#1976d2",
  },
  cajero_principal: {
    bg: "rgba(0, 150, 136, 0.12)",
    color: "#00897b",
    border: "#00897b",
  },
  mesero: {
    bg: "rgba(46, 125, 50, 0.12)",
    color: "#2e7d32",
    border: "#2e7d32",
  },
  cocinero: {
    bg: "rgba(237, 108, 2, 0.12)",
    color: "#ed6c02",
    border: "#ed6c02",
  },
  motorizado: {
    bg: "rgba(2, 136, 209, 0.12)",
    color: "#0288d1",
    border: "#0288d1",
  },
  despachador: {
    bg: "rgba(211, 47, 47, 0.12)",
    color: "#d32f2f",
    border: "#d32f2f",
  },
};

export default function ShiftHistoryPage() {
  const { shifts, users, loading, error, reload } = useShiftHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getUserInfo = useCallback((cashierName: string) => {
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cashierName.toLowerCase() ||
        `${u.firstName} ${u.lastName}`.trim().toLowerCase() ===
          cashierName.toLowerCase()
    );

    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : null;
    const role: UserRole | undefined = user?.role;
    const roleLabel = role ? ROLE_LABELS[role] : undefined;

    return { user, fullName, role, roleLabel };
  }, [users]);

  // Filtrar turnos según búsqueda por texto, rol y estado
  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const { fullName, role, roleLabel } = getUserInfo(shift.cashierName);

      // Filtro por Estado
      if (statusFilter !== "all" && shift.status !== statusFilter) {
        return false;
      }

      // Filtro por Rol
      if (roleFilter !== "all" && role !== roleFilter) {
        return false;
      }

      // Filtro por Texto de Búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchUsername = shift.cashierName.toLowerCase().includes(query);
        const matchFullName = fullName ? fullName.toLowerCase().includes(query) : false;
        const matchRole = roleLabel ? roleLabel.toLowerCase().includes(query) : false;
        const matchRegister = shift.cashRegisterName
          ? shift.cashRegisterName.toLowerCase().includes(query)
          : false;
        const matchNotes = shift.notes ? shift.notes.toLowerCase().includes(query) : false;

        if (
          !matchUsername &&
          !matchFullName &&
          !matchRole &&
          !matchRegister &&
          !matchNotes
        ) {
          return false;
        }
      }

      return true;
    });
  }, [shifts, searchTerm, roleFilter, statusFilter, getUserInfo]);

  const hasActiveFilters =
    searchTerm.trim() !== "" || roleFilter !== "all" || statusFilter !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
      }}
    >
      <PageHeader
        title="Historial de Turnos"
        startContent={<BackButton to="/home" />}
        actions={
          <Tooltip title="Actualizar historial">
            <IconButton
              onClick={reload}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <RefreshIcon color="primary" />
            </IconButton>
          </Tooltip>
        }
      />

      {error && (
        <Typography color="error" variant="body1" textAlign="center" mb={2}>
          {error}
        </Typography>
      )}

      {/* Barra de Búsqueda y Filtros de Colaboradores */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flex={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          {/* Campo de Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar por colaborador, nombre, rol o caja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: { sm: 280 } }}
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
                    onClick={() => setSearchTerm("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Filtro por Rol */}
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 170 } }}>
            <InputLabel id="role-filter-label">Rol</InputLabel>
            <Select
              labelId="role-filter-label"
              value={roleFilter}
              label="Rol"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">Todos los roles</MenuItem>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro por Estado */}
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
            <InputLabel id="status-filter-label">Estado</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Estado"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="open">Abiertos</MenuItem>
              <MenuItem value="closed">Cerrados</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Acciones de Filtro y Contador */}
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
          <Chip
            label={`${filteredShifts.length} ${
              filteredShifts.length === 1 ? "turno" : "turnos"
            }`}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{ fontWeight: "bold" }}
          />

          {hasActiveFilters && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={handleClearFilters}
              sx={{ whiteSpace: "nowrap" }}
            >
              Limpiar filtros
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Tabla de Historial de Turnos */}
      <TableContainer
        component={Paper}
        elevation={4}
        sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: (theme) => theme.palette.action.hover }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Colaborador / Cajero</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Caja</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Apertura</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Cierre</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Ventas Total
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Efectivo Real
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Estado
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Detalles
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <CircularProgress
                    size={28}
                    sx={{ color: "primary.main", mb: 1.5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Cargando turnos de todos los colaboradores...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredShifts.length > 0 ? (
              filteredShifts.map((shift) => {
                const { fullName, role, roleLabel } = getUserInfo(shift.cashierName);
                const roleStyle = role ? ROLE_COLORS[role] : undefined;

                return (
                  <TableRow key={shift.id} hover>
                    {/* Colaborador con Rol */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <PersonIcon color="action" fontSize="small" />
                        <Box>
                          <Typography variant="body2" fontWeight="700" color="text.primary">
                            {fullName || shift.cashierName}
                          </Typography>
                          {fullName && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              @{shift.cashierName}
                            </Typography>
                          )}
                        </Box>
                        {roleLabel && (
                          <Chip
                            label={roleLabel}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              bgcolor: roleStyle?.bg || "action.hover",
                              color: roleStyle?.color || "text.primary",
                              border: "1px solid",
                              borderColor: roleStyle?.border || "divider",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Caja */}
                    <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>
                      {shift.cashRegisterName || "General"}
                    </TableCell>

                    {/* Apertura */}
                    <TableCell>{formatDate(shift.startTime)}</TableCell>

                    {/* Cierre */}
                    <TableCell>
                      {shift.endTime ? (
                        formatDate(shift.endTime)
                      ) : (
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          En curso
                        </Typography>
                      )}
                    </TableCell>

                    {/* Ventas Total */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        C${shift.totalSales.total.toFixed(2)}
                      </Typography>
                    </TableCell>

                    {}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {shift.closingAmount !== undefined
                          ? `C$${shift.closingAmount.toFixed(2)}`
                          : "---"}
                      </Typography>
                    </TableCell>

                    {/* Estado */}
                    <TableCell align="center">
                      <Chip
                        label={shift.status === "open" ? "Abierto" : "Cerrado"}
                        color={shift.status === "open" ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>

                    {/* Botón Detalles */}
                    <TableCell align="center">
                      <Tooltip title="Ver detalle completo">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedShift(shift)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary" variant="body1">
                    No se encontraron turnos con los filtros seleccionados.
                  </Typography>
                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleClearFilters}
                      sx={{ mt: 1.5 }}
                    >
                      Restablecer filtros
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Detalle de Turno */}
      {selectedShift && (
        <Dialog
          open={Boolean(selectedShift)}
          onClose={() => setSelectedShift(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, p: 1 },
          }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Detalle del Turno #{selectedShift.id.split("-")[1] || selectedShift.id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cajero: {selectedShift.cashierName} • Caja: {selectedShift.cashRegisterName || "General"}
              </Typography>
            </Box>
            <Chip
              label={selectedShift.status === "open" ? "Abierto" : "Cerrado"}
              color={selectedShift.status === "open" ? "success" : "default"}
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </DialogTitle>

          <DialogContent dividers>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Apertura
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatDate(selectedShift.startTime)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cierre
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {selectedShift.endTime ? formatDate(selectedShift.endTime) : "En curso"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1.5}>
              Resumen de Ventas
            </Typography>

            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Efectivo
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  C${selectedShift.totalSales.cash.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tarjeta
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  C${selectedShift.totalSales.card.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  App/Delivery
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  C${selectedShift.totalSales.app.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                TOTAL VENTAS:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                C${selectedShift.totalSales.total.toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1.5}>
              Arqueo de Efectivo
            </Typography>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Monto Inicial (Apertura)
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  C${selectedShift.openingAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ventas en Efectivo
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  + C${selectedShift.totalSales.cash.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Gastos / Egresos
                </Typography>
                <Typography variant="body2" fontWeight="600" color="error.main">
                  - C${(selectedShift.totalExpenses || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Esperado
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  C$
                  {(
                    selectedShift.expectedCash ??
                    selectedShift.openingAmount +
                      selectedShift.totalSales.cash -
                      (selectedShift.totalExpenses || 0)
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 1.5,
                bgcolor: "background.default",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Efectivo Contado (Cierre):
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedShift.closingAmount !== undefined
                    ? `C$${selectedShift.closingAmount.toFixed(2)}`
                    : "---"}
                </Typography>
              </Box>
              {selectedShift.closingAmount !== undefined && (
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">
                    Diferencia Efectivo:
                  </Typography>
                  {(() => {
                    const expected =
                      selectedShift.expectedCash ??
                      selectedShift.openingAmount +
                        selectedShift.totalSales.cash -
                        (selectedShift.totalExpenses || 0);
                    const diff =
                      selectedShift.cashDifference ??
                      selectedShift.closingAmount - expected;
                    return (
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={
                          Math.abs(diff) < 0.01
                            ? "success.main"
                            : diff > 0
                              ? "info.main"
                              : "error.main"
                        }
                      >
                        {Math.abs(diff) < 0.01
                          ? "Exacto (C$0.00)"
                          : `${diff > 0 ? "+" : ""}C$${diff.toFixed(2)}`}
                      </Typography>
                    );
                  })()}
                </Box>
              )}
            </Box>

            {/* SECCIÓN MULTI-MÉTODO */}
            {selectedShift.status === "closed" && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  mb: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  Conciliación Multi-Método:
                </Typography>
                <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1.5} mb={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      💵 Efectivo Real
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      C${(selectedShift.closingAmount || 0).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        Math.abs(selectedShift.cashDifference || 0) < 0.01
                          ? "success.main"
                          : "error.main"
                      }
                      fontWeight="bold"
                    >
                      Dif: {(selectedShift.cashDifference || 0) >= 0 ? "+" : ""}
                      C${(selectedShift.cashDifference || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      💳 Vouchers Tarjeta
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      C${(selectedShift.declaredCardAmount || 0).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        Math.abs(selectedShift.cardDifference || 0) < 0.01
                          ? "success.main"
                          : "error.main"
                      }
                      fontWeight="bold"
                    >
                      Dif: {(selectedShift.cardDifference || 0) >= 0 ? "+" : ""}
                      C${(selectedShift.cardDifference || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      📱 Depósitos App
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      C${(selectedShift.declaredAppAmount || 0).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        Math.abs(selectedShift.appDifference || 0) < 0.01
                          ? "success.main"
                          : "error.main"
                      }
                      fontWeight="bold"
                    >
                      Dif: {(selectedShift.appDifference || 0) >= 0 ? "+" : ""}
                      C${(selectedShift.appDifference || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight="bold">
                    Diferencia Neta Total:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={
                      Math.abs(
                        selectedShift.totalDifference ??
                          selectedShift.cashDifference ??
                          0,
                      ) < 0.01
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {(selectedShift.totalDifference ??
                      selectedShift.cashDifference ??
                      0) >= 0
                      ? "+"
                      : ""}
                    C$
                    {(
                      selectedShift.totalDifference ??
                      selectedShift.cashDifference ??
                      0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedShift.expenses && selectedShift.expenses.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Typography variant="subtitle2" fontWeight="bold" color="error">
                    Desglose de Gastos ({selectedShift.expenses.length})
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    - C${(selectedShift.totalExpenses || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {selectedShift.expenses.map((exp) => (
                    <Box
                      key={exp.id}
                      sx={{
                        p: 1,
                        bgcolor: "rgba(211, 47, 47, 0.04)",
                        borderRadius: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {exp.reason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.category}{" "}
                          {exp.voucherNumber
                            ? `• Comprobante: ${exp.voucherNumber}`
                            : ""}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="error.main"
                      >
                        - C${Number(exp.amount).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}

            {selectedShift.notes && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(255, 193, 7, 0.1)", borderRadius: 2, borderLeft: "3px solid #ffc107" }}>
                <Typography variant="caption" fontWeight="bold" color="warning.main" display="block">
                  Notas del Turno:
                </Typography>
                <Typography variant="body2">{selectedShift.notes}</Typography>
              </Box>
            )}

            {selectedShift.discrepancyReason && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="caption" fontWeight="bold" display="block">
                  Justificación del descuadre
                </Typography>
                {selectedShift.discrepancyReason}
                {selectedShift.authorizedByName && (
                  <Typography variant="caption" display="block" mt={0.5}>
                    Autorizado por {selectedShift.authorizedByName} ({selectedShift.authorizedByRole})
                  </Typography>
                )}
              </Alert>
            )}

            {/* Componente oculto para impresión física de ticket */}
            <ShiftTicketPrint shift={selectedShift} />
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              startIcon={<PrintIcon />}
              variant="outlined"
              onClick={() => window.print()}
            >
              Imprimir Arqueo
            </Button>
            <Button variant="contained" onClick={() => setSelectedShift(null)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
