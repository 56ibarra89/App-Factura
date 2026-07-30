import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Switch,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PrintIcon from "@mui/icons-material/Print";
import SettingsIcon from "@mui/icons-material/Settings";
import type { Device } from "../../api/deviceGateway";
import { LOGIN_COLORS } from "../../../../shared/theme";

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const connected = device.status === "connected";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 5,
        border: "1px solid",
        borderColor: connected
          ? alpha(LOGIN_COLORS.primary, 0.3)
          : "divider",
        background: connected
          ? (theme) =>
              `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(LOGIN_COLORS.primary, 0.05)} 100%)`
          : "background.paper",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
          borderColor: LOGIN_COLORS.primary,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}
      >
        <Avatar
          sx={{
            bgcolor: connected
              ? alpha(LOGIN_COLORS.primary, 0.1)
              : "grey.100",
            color: connected ? LOGIN_COLORS.primary : "grey.500",
            width: 52,
            height: 52,
            borderRadius: 4,
          }}
        >
          {device.type === "printer" && <PrintIcon fontSize="medium" />}
          {device.type === "drawer" && <PointOfSaleIcon fontSize="medium" />}
        </Avatar>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={connected ? "Conectado" : "Desconectado"}>
            {connected ? (
              <CheckCircleIcon sx={{ color: "#2ecc71", fontSize: 18 }} />
            ) : (
              <ErrorIcon sx={{ color: "#e74c3c", fontSize: 18 }} />
            )}
          </Tooltip>
          <Switch
            size="small"
            checked={connected}
            color="primary"
            slotProps={{ input: { readOnly: true } }}
          />
        </Box>
      </Box>

      <Typography variant="subtitle1" fontWeight="900" noWrap>
        {device.name}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, minHeight: 40 }}
      >
        {device.details}
      </Typography>

      <Divider sx={{ mb: 2, opacity: 0.6 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          size="small"
          variant="text"
          startIcon={<SettingsIcon />}
          sx={{ fontWeight: "bold", textTransform: "none" }}
        >
          Configurar
        </Button>
        {device.isDefault && (
          <Chip
            label="Principal"
            color="primary"
            size="small"
            sx={{
              fontWeight: 900,
              fontSize: "0.65rem",
              height: 20,
              borderRadius: 1.5,
              boxShadow: `0 4px 10px ${alpha(LOGIN_COLORS.primary, 0.3)}`,
            }}
          />
        )}
      </Box>
    </Paper>
  );
}
