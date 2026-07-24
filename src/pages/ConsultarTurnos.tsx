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
  CircularProgress
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BackButton } from "../components/BackButton";
import InfoIcon from "@mui/icons-material/Info";
import { useTurnosHistory } from "../hooks/useTurnosHistory";

export default function ConsultarTurnos() {
  const { shifts, loading, error, reload } = useTurnosHistory();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        p: { xs: 2, md: 4 }
      }}
    >
      <PageHeader
        title="Historial de Turnos"
        startContent={<BackButton to="/home" />}
        actions={
          <IconButton 
            onClick={reload} 
            sx={{ bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "action.hover" } }}
          >
            <RefreshIcon color="primary" />
          </IconButton>
        }
      />

      {error && (
        <Typography color="error" variant="body1" textAlign="center" mb={2}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Cajero</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Caja</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Apertura</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cierre</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ventas Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Efectivo Real</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={24} sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Cargando turnos...</Typography>
                </TableCell>
              </TableRow>
            ) : shifts.map((shift) => (
              <TableRow key={shift.id} hover>
                <TableCell sx={{ fontWeight: "600" }}>{shift.cashierName}</TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{shift.cashRegisterName || "General"}</TableCell>
                <TableCell>{formatDate(shift.startTime)}</TableCell>
                <TableCell>{shift.endTime ? formatDate(shift.endTime) : "---"}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    C${shift.totalSales.total.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    C${shift.closingAmount?.toFixed(2) || "---"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={shift.status === 'open' ? "Abierto" : "Cerrado"} 
                    color={shift.status === 'open' ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={shift.notes || "Sin notas"}>
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {shifts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No se encontraron turnos registrados.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
