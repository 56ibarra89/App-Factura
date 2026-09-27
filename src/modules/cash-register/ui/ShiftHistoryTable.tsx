import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShieldIcon from "@mui/icons-material/Shield";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import type { Shift } from "../model/cash-register.types";
import type { UserAccount } from "../../accounts";
import {
  calculateDuration,
  formatDate,
  getShiftDifference,
  ROLE_COLORS,
} from "../model/shiftAuditDomain";
import { ROLE_LABELS, type UserRole } from "../../auth";

interface Props {
  shifts: Shift[];
  loading: boolean;
  users: UserAccount[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSelectShift: (shift: Shift) => void;
  onDirectPrint: (shift: Shift) => void;
  onAdminCloseShift: () => void;
  userRole?: UserRole | string | null;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ShiftHistoryTable({
  shifts,
  loading,
  users,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSelectShift,
  onDirectPrint,
  onAdminCloseShift,
  userRole,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  const getUserInfo = (cashierName: string) => {
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cashierName.toLowerCase() ||
        `${u.firstName} ${u.lastName}`.trim().toLowerCase() ===
          cashierName.toLowerCase(),
    );

    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : null;
    const role: UserRole | undefined = user?.role;
    const roleLabel = role ? ROLE_LABELS[role] : undefined;

    return { user, fullName, role, roleLabel };
  };

  const paginatedShifts = shifts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: (theme) => theme.palette.action.hover }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Colaborador / Caja</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Modalidad</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Horario & Duración</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Arqueo Declarado (3 Métodos)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Cuadre / Diferencia
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress
                    size={28}
                    sx={{ color: "primary.main", mb: 1.5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Cargando historial de turnos y relevos...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedShifts.length > 0 ? (
              paginatedShifts.map((shift) => {
                const { fullName, role, roleLabel } = getUserInfo(
                  shift.cashierName,
                );
                const roleStyle = role ? ROLE_COLORS[role] : undefined;
                const duration = calculateDuration(
                  shift.startTime,
                  shift.endTime,
                );
                const isOpen = shift.status === "open";
                const isHandover = shift.closeType === "HANDOVER";
                const diffs = getShiftDifference(shift);

                return (
                  <TableRow key={shift.id} hover>
                    {/* Colaborador / Caja */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <PersonIcon color="action" fontSize="small" />
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="body2"
                              fontWeight="700"
                              color="text.primary"
                            >
                              {fullName || shift.cashierName}
                            </Typography>
                            {roleLabel && (
                              <Chip
                                label={roleLabel}
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    fontWeight: 800,
                                    bgcolor: roleStyle?.bg || "action.hover",
                                    color: roleStyle?.color || "text.primary",
                                    border: "1px solid",
                                    borderColor: roleStyle?.border || "divider",
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={0.6}
                            mt={0.3}
                          >
                            <PointOfSaleIcon
                              sx={{ fontSize: 13, color: "text.secondary" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="500"
                            >
                              {shift.cashRegisterName || "Caja Principal"}
                            </Typography>
                            {fullName && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                • @{shift.cashierName}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Modalidad de Cierre */}
                    <TableCell>
                      {isOpen ? (
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                          label="En Curso"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      ) : isHandover ? (
                        <Chip
                          icon={<SyncAltIcon sx={{ fontSize: "14px !important" }} />}
                          label="Relevo de Turno"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: alpha("#0288d1", 0.1),
                            color: "#0288d1",
                            borderColor: "#0288d1",
                            border: "1px solid",
                          }}
                        />
                      ) : (
                        <Chip
                          icon={
                            <NightlightRoundIcon sx={{ fontSize: "14px !important" }} />
                          }
                          label="Cierre Final"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: alpha("#ed6c02", 0.1),
                            color: "#ed6c02",
                            borderColor: "#ed6c02",
                            border: "1px solid",
                          }}
                        />
                      )}
                    </TableCell>

                    {/* Horario & Duración */}
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {formatDate(shift.startTime)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {shift.endTime ? (
                          `Hasta: ${formatDate(shift.endTime)}`
                        ) : (
                          <Box
                            component="span"
                            color="success.main"
                            fontWeight="bold"
                          >
                            Turno activo
                          </Box>
                        )}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.8} mt={0.5}>
                        <Chip
                          label={duration.durationText}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                          }}
                        />
                        {duration.isExcessive && (
                          <Tooltip title="Duración anormalmente larga (>16h). Posible turno abandonado sin cierre oportuno.">
                            <Chip
                              label={`⚠️ ${duration.hours}h Excesivo`}
                              size="small"
                              color="error"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                              }}
                            />
                          </Tooltip>
                        )}
                        {duration.isUltraShort && (
                          <Tooltip title="Turno ultracorto (<5 min). Posible apertura o cierre accidental.">
                            <Chip
                              label="⚡ Ultracorto"
                              size="small"
                              color="warning"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                              }}
                            />
                          </Tooltip>
                        )}
                        {duration.isOpenProlonged && (
                          <Tooltip title="Turno en curso por más de 12 horas. Se recomienda realizar el corte de caja.">
                            <Chip
                              label="⏳ >12h Activo"
                              size="small"
                              color="warning"
                              sx={{
                                height: 18,
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Arqueo Declarado (3 Métodos) */}
                    <TableCell>
                      <Stack spacing={0.3}>
                        {/* 1. Efectivo */}
                        <Box display="flex" alignItems="center" gap={0.8}>
                          <AttachMoneyIcon
                            sx={{ fontSize: 14, color: "#2e7d32" }}
                          />
                          <Typography
                            variant="body2"
                            fontSize="0.78rem"
                            fontWeight="600"
                          >
                            Efec:{" "}
                            {shift.closingAmount !== undefined
                              ? `C$${shift.closingAmount.toFixed(2)}`
                              : "---"}
                          </Typography>
                          {Number(shift.totalExpenses || 0) > 0 && (
                            <Tooltip
                              title={`Salidas de dinero en caja menor: -C$${Number(
                                shift.totalExpenses,
                              ).toFixed(2)}`}
                            >
                              <Chip
                                label={`-C$${Number(shift.totalExpenses).toFixed(0)}`}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{
                                  height: 16,
                                  fontSize: "0.6rem",
                                  fontWeight: "bold",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>

                        {/* 2. Tarjetas */}
                        <Box display="flex" alignItems="center" gap={0.8}>
                          <CreditCardIcon
                            sx={{ fontSize: 14, color: "#0288d1" }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.75rem"
                          >
                            POS:{" "}
                            {shift.declaredCardAmount !== undefined
                              ? `C$${Number(shift.declaredCardAmount).toFixed(2)}`
                              : `C$${(shift.totalSales.card || 0).toFixed(2)}`}
                          </Typography>
                        </Box>

                        {/* 3. Apps */}
                        <Box display="flex" alignItems="center" gap={0.8}>
                          <PhoneAndroidIcon
                            sx={{ fontSize: 14, color: "#ed6c02" }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontSize="0.75rem"
                          >
                            App:{" "}
                            {shift.declaredAppAmount !== undefined
                              ? `C$${Number(shift.declaredAppAmount).toFixed(2)}`
                              : `C$${(shift.totalSales.app || 0).toFixed(2)}`}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Cuadre / Diferencia */}
                    <TableCell align="right">
                      {isOpen ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          Sin cerrar
                        </Typography>
                      ) : (
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-end"
                          gap={0.5}
                        >
                          <Chip
                            icon={
                              diffs.isBalanced ? (
                                <CheckCircleIcon sx={{ fontSize: "14px !important" }} />
                              ) : (
                                <WarningAmberIcon sx={{ fontSize: "14px !important" }} />
                              )
                            }
                            label={
                              diffs.isBalanced
                                ? "Exacto (C$0.00)"
                                : `${diffs.totalDiff > 0 ? "Sobrante +" : "Faltante "}C$${diffs.totalDiff.toFixed(2)}`
                            }
                            color={
                              diffs.isBalanced
                                ? "success"
                                : diffs.totalDiff > 0
                                  ? "info"
                                  : "error"
                            }
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />

                          {/* Badge de Seguridad si hubo PIN */}
                          {shift.authorizedByName && (
                            <Tooltip
                              title={`Descuadre autorizado por @${shift.authorizedByName} (${shift.authorizedByRole || "Admin"}). Motivo: "${shift.discrepancyReason || "Sin justificación"}"`}
                            >
                              <Chip
                                icon={
                                  <ShieldIcon sx={{ fontSize: "13px !important" }} />
                                }
                                label={`Autorizado @${shift.authorizedByName}`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  bgcolor: "rgba(156, 39, 176, 0.1)",
                                  color: "#ab47bc",
                                  borderColor: "#ab47bc",
                                  border: "1px solid",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Tooltip title="Ver expediente de turno">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onSelectShift(shift)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Reimpresión rápida de ticket */}
                        {shift.status === "closed" && (
                          <Tooltip title="Reimprimir ticket de arqueo">
                            <IconButton
                              size="small"
                              color="inherit"
                              onClick={() => onDirectPrint(shift)}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Acción para Admin en turnos huérfanos */}
                        {isOpen && userRole === "admin" && (
                          <Tooltip title="Liquidar / Cerrar turno en curso">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={onAdminCloseShift}
                            >
                              <SyncAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary" variant="body1">
                    No se encontraron turnos con los filtros seleccionados.
                  </Typography>
                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={onClearFilters}
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

      {/* PAGINACIÓN NATIVA MATERIAL UI */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={shifts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
}
