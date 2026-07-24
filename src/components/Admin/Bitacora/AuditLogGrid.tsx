import { useMemo } from "react";
import {
  Chip,
  Paper,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { SystemLog, LogLevel } from "../../../types/log.types";
import type { UserAccount } from "../../../types/user";
import { LOGIN_COLORS } from "../../../theme/loginTheme";

const ACTION_LABELS: Record<string, string> = {
  ORDER_FINALIZED: "Facturar Orden",
  LOGIN_PASSWORD: "Login (Contraseña)",
  LOGIN_PIN: "Login (PIN)",
  LOGOUT: "Cierre de Sesión",
  CONFIG_CHANGE: "Configuración",
  CREATE_RESERVATION: "Crear Reserva",
  CANCEL_RESERVATION: "Cancelar Reserva",
  PRODUCT_CREATE: "Crear Producto",
  PRODUCT_UPDATE: "Editar Producto",
  PRODUCT_DELETE: "Eliminar Producto",
  CLEAR_HISTORY: "Limpiar Historial",
  USER_CREATE: "Crear Usuario",
  USER_UPDATE: "Editar Usuario",
  USER_UPDATE_STATUS: "Estado Usuario",
  USER_DELETE: "Eliminar Usuario",
};

function formatDetails(details?: string) {
  if (!details) return null;

  try {
    if (!details.startsWith("{") || !details.endsWith("}")) return details;
    const parsed = JSON.parse(details) as Record<string, unknown>;
    if (parsed.invoiceNumber && parsed.orderId) {
      const internalNumber = parsed.issuedNumber
        ? ` (Nro interno: ${String(parsed.issuedNumber)})`
        : "";
      return `Factura #${String(parsed.invoiceNumber)} generada para la orden ${String(parsed.orderId)}${internalNumber}`;
    }
    return Object.entries(parsed)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ");
  } catch {
    return details;
  }
}

interface AuditLogGridProps {
  logs: SystemLog[];
  users: UserAccount[];
  loading: boolean;
}

export default function AuditLogGrid({
  logs,
  users,
  loading,
}: AuditLogGridProps) {
  const columns = useMemo<GridColDef<SystemLog>[]>(
    () => [
      {
        field: "timestamp",
        headerName: "Fecha y Hora",
        width: 200,
        renderCell: (params: GridRenderCellParams<SystemLog, number>) => (
          <Typography variant="body2" fontWeight={500}>
            {format(params.value ?? 0, "dd MMM yyyy, HH:mm:ss", { locale: es })}
          </Typography>
        ),
      },
      {
        field: "user",
        headerName: "Usuario",
        width: 130,
        renderCell: (params: GridRenderCellParams<SystemLog, string>) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: LOGIN_COLORS.primary }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "role",
        headerName: "Rol",
        width: 120,
        renderCell: (params: GridRenderCellParams<SystemLog, string | null>) => {
          const role =
            params.value ||
            users.find((user) => user.username === params.row.user)?.role ||
            "N/A";
          return (
            <Chip
              label={role}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            />
          );
        },
      },
      {
        field: "action",
        headerName: "Acción",
        width: 180,
        renderCell: (params: GridRenderCellParams<SystemLog, string>) => (
          <Chip
            label={ACTION_LABELS[params.value ?? ""] || params.value}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, borderRadius: 1 }}
          />
        ),
      },
      {
        field: "details",
        headerName: "Detalles del Evento",
        flex: 1,
        minWidth: 300,
        renderCell: (params: GridRenderCellParams<SystemLog, string>) => (
          <Typography
            variant="body2"
            color={params.value ? "text.primary" : "text.secondary"}
            sx={{
              whiteSpace: "normal",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {formatDetails(params.value) ?? "Sin detalles"}
          </Typography>
        ),
      },
      {
        field: "level",
        headerName: "Nivel",
        width: 100,
        renderCell: (
          params: GridRenderCellParams<SystemLog, LogLevel>,
        ) => {
          const level = params.value ?? "info";
          const color =
            level === "warn"
              ? "warning"
              : level === "error"
                ? "error"
                : "info";
          return (
            <Chip
              label={level}
              size="small"
              color={color}
              variant="filled"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "0.6rem",
              }}
            />
          );
        },
      },
    ],
    [users],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: 650,
        width: "100%",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
      }}
    >
      <DataGrid
        rows={logs}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id ?? `${row.timestamp}-${row.action}`}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "rgba(0,0,0,0.02)",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-cell:focus": { outline: "none" },
        }}
      />
    </Paper>
  );
}
