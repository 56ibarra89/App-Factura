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
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "border-color 120ms ease-out, box-shadow 120ms ease-out",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderColor: "primary.main",
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
              ? (theme) => alpha(theme.palette.success.main, 0.12)
              : "action.hover",
            color: connected ? "success.main" : "text.disabled",
            width: 52,
            height: 52,
            borderRadius: 2,
          }}
        >
          {device.type === "printer" && <PrintIcon fontSize="medium" />}
          {device.type === "drawer" && <PointOfSaleIcon fontSize="medium" />}
        </Avatar>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={connected ? "Conectado" : "Desconectado"}>
            {connected ? (
              <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />
            ) : (
              <ErrorIcon sx={{ color: "error.main", fontSize: 18 }} />
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
              boxShadow: "none",
            }}
          />
        )}
      </Box>
    </Paper>
  );
}
