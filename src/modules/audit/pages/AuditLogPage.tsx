import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Paper,
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { BackButton, PageHeader } from "../../../shared/ui";
import AuditLogGrid from "../ui/AuditLogGrid";
import { AuditLogStats } from "../ui/AuditLogStats";
import { AuditLogFilters } from "../ui/AuditLogFilters";
import { AuditLogDetailDialog } from "../ui/AuditLogDetailDialog";
import { useAuditLog } from "../hooks/useAuditLog";

const AuditLogPage = () => {
  const audit = useAuditLog();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Bitácora de Auditoría"
        startContent={<BackButton to="/admin" />}
        actions={
          <Box display="flex" gap={1}>
            <Tooltip title="Exportar Bitácora Filtrada (CSV)">
              <span>
                <IconButton
                  onClick={audit.exportCsv}
                  color="primary"
                  disabled={audit.loading || audit.filteredCount === 0}
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Actualizar registros">
              <span>
                <IconButton
                  onClick={audit.refresh}
                  color="primary"
                  disabled={audit.loading}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        }
      />

      <Box sx={{ mt: 2 }}>
        {/* Banner de Seguridad y Trazabilidad ISO 27001 */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            mb: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "rgba(211, 47, 47, 0.2)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: "rgba(211, 47, 47, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 26 }} />
          </Box>

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.4}>
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                Trazabilidad Inmutable y Auditoría Interna
              </Typography>
              <Chip
                icon={<LockOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                label="ISO/IEC 27001"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  bgcolor: "rgba(211, 47, 47, 0.04)",
                }}
              />
              <Chip
                label="Solo Lectura"
                size="small"
                variant="filled"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: "action.hover",
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", lineHeight: 1.45 }}>
              Este registro es <b>estrictamente inmutable y cronológico</b> según los estándares de seguridad ISO 27001.
              Monitorea con precisión accesos de personal, operaciones de facturación, arqueos de caja y excepciones críticas del sistema para garantizar la total transparencia operativa.
            </Typography>
          </Box>
        </Paper>

        {/* Tarjetas de Métricas KPI */}
        <AuditLogStats stats={audit.stats} />

        {/* Barra de Filtros y Búsqueda */}
        <AuditLogFilters
          filters={audit.filters}
          onFilterChange={audit.updateFilter}
          onResetFilters={audit.resetFilters}
          onDatePreset={audit.setDatePreset}
          availableUsers={audit.availableUsers}
          totalFiltered={audit.filteredCount}
          totalLogs={audit.totalCount}
        />

        {/* Tabla DataGrid con acciones de detalle */}
        <AuditLogGrid
          logs={audit.logs}
          loading={audit.loading}
          onViewDetails={audit.handleViewDetails}
        />

        {/* Modal Diálogo para Inspección Completa */}
        <AuditLogDetailDialog
          log={audit.selectedLog}
          open={audit.detailOpen}
          onClose={audit.handleCloseDetails}
        />
      </Box>
    </Box>
  );
};

export default AuditLogPage;
