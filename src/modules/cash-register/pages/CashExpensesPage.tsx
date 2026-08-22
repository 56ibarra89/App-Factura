import { useState, useMemo } from "react";
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
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import PrintIcon from "@mui/icons-material/Print";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { BackButton, PageHeader } from "../../../shared/ui";
import { useCashExpenses } from "../hooks/useCashExpenses";
import {
  CASH_EXPENSE_CATEGORY_LABELS,
  type CashExpense,
  type CashExpenseCategory,
} from "../model/cash-expense.types";
import CashExpenseDialog from "../ui/CashExpenseDialog";
import CashExpenseVoucherPrint from "../ui/CashExpenseVoucherPrint";

export default function CashExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrintExpense, setSelectedPrintExpense] = useState<CashExpense | null>(null);

  const { expenses, loading, fetchExpenses } = useCashExpenses();

  const handleRefresh = () => {
    void fetchExpenses({
      category: categoryFilter !== "all" ? (categoryFilter as CashExpenseCategory) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handlePrintExpense = (expense: CashExpense) => {
    setSelectedPrintExpense(expense);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        searchTerm === "" ||
        exp.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.cashierSnapshotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.voucherNumber &&
          exp.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || exp.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const averageExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return totalFilteredAmount / filteredExpenses.length;
  }, [filteredExpenses, totalFilteredAmount]);

  return (
    <Box
      minHeight="100vh"
      boxSizing="border-box"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 6,
        px: { xs: 2, md: 6 },
      }}
    >
      {/* Encabezado */}
      <PageHeader
        title="Gastos de Caja Chica"
        startContent={<BackButton to="/home" />}
        actions={
          <Button
            variant="contained"
            color="error"
            startIcon={<AddCircleIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ borderRadius: 2, px: 3, fontWeight: "bold" }}
          >
            Registrar Gasto
          </Button>
        }
      />

      {/* Tarjetas de Resumen KPI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              borderLeft: "4px solid #d32f2f",
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    TOTAL GASTADO (FILTRO)
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ mt: 0.5 }}>
                    C${totalFilteredAmount.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, color: "error.main", opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              borderLeft: "4px solid #1976d2",
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    CANTIDAD DE EGRESOS
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mt: 0.5 }}>
                    {filteredExpenses.length} movimientos
                  </Typography>
                </Box>
                <ReceiptLongIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={1}
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              borderLeft: "4px solid #f57c00",
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    PROMEDIO POR GASTO
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ mt: 0.5 }}>
                    C${averageExpense.toFixed(2)}
                  </Typography>
                </Box>
                <MoneyOffIcon sx={{ fontSize: 40, color: "warning.main", opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Filtros */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          {/* Búsqueda */}
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por motivo, cajero o N° comprobante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Filtro de Categoría */}
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="filter-category-label">Categoría</InputLabel>
            <Select
              labelId="filter-category-label"
              value={categoryFilter}
              label="Categoría"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">Todas las Categorías</MenuItem>
              {Object.entries(CASH_EXPENSE_CATEGORY_LABELS).map(([key, val]) => (
                <MenuItem key={key} value={key}>
                  {val.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro Fecha Desde */}
          <TextField
            size="small"
            type="date"
            label="Desde"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          {/* Filtro Fecha Hasta */}
          <TextField
            size="small"
            type="date"
            label="Hasta"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          {/* Botón Refrescar */}
          <Tooltip title="Actualizar">
            <IconButton onClick={handleRefresh} color="primary" sx={{ p: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Tabla de Movimientos */}
      <Paper elevation={1} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  Fecha y Hora
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  Cajero
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  Categoría
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  Concepto / Justificación
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  N° Comprobante
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  Monto
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "background.paper" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} color="error" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Cargando registros de gastos...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const cat =
                    CASH_EXPENSE_CATEGORY_LABELS[expense.category] || {
                      label: expense.category,
                      color: "#616161",
                    };

                  return (
                    <TableRow key={expense.id} hover>
                      <TableCell>{formatDate(expense.createdAt)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {expense.cashierSnapshotName}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cat.label}
                          size="small"
                          sx={{
                            bgcolor: `${cat.color}1A`,
                            color: cat.color,
                            fontWeight: "bold",
                            border: `1px solid ${cat.color}4D`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" fontWeight="500">
                          {expense.reason}
                        </Typography>
                        {expense.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {expense.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {expense.voucherNumber || "---"}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          - C${expense.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Reimprimir Comprobante Térmico">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handlePrintExpense(expense)}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" variant="body1">
                      No se encontraron registros de gastos con los filtros aplicados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Registro */}
      <CashExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          void fetchExpenses();
        }}
      />

      {/* Comprobante Térmico Oculto para Impresión */}
      {selectedPrintExpense && (
        <CashExpenseVoucherPrint expense={selectedPrintExpense} />
      )}
    </Box>
  );
}
