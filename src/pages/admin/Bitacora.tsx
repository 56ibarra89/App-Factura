import {
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import PinValidationDialog from "../../components/auth/PinValidationDialog";
import AuditLogGrid from "../../components/Admin/Bitacora/AuditLogGrid";
import { useAuditLog } from "../../hooks/useAuditLog";

const Bitacora = () => {
  const navigate = useNavigate();
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
        title="Bitácora de Auditoría (ISO 27001)"
        startContent={<BackButton to="/admin" />}
        actions={
          <Box display="flex" gap={1}>
            <IconButton
              onClick={audit.exportCsv}
              color="primary"
              disabled={audit.loading || audit.logs.length === 0}
              title="Exportar Bitácora (CSV)"
            >
              <DownloadIcon />
            </IconButton>
            <IconButton
              onClick={audit.refresh}
              color="primary"
              disabled={audit.loading}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        }
      />

      <Box
        sx={{
          mt: 3,
          opacity: audit.authorized ? 1 : 0.4,
          pointerEvents: audit.authorized ? "auto" : "none",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 800 }}
        >
          Este registro es inmutable y cronológico. Muestra todas las acciones
          críticas realizadas por los usuarios para facilitar la auditoría
          interna.
        </Typography>

        {audit.authorized && (
          <AuditLogGrid
            logs={audit.logs}
            users={audit.users}
            loading={audit.loading}
          />
        )}
      </Box>

      <PinValidationDialog
        open={audit.pinDialogOpen}
        onClose={() => navigate("/admin")}
        onSuccess={audit.authorize}
        title="Acceso a Bitácora (Admin)"
      />
    </Box>
  );
};

export default Bitacora;
