import { useMemo } from "react";
import {
  Chip,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { SystemLog, LogLevel } from "../model/audit.types";
import { LOGIN_COLORS } from "../../../shared/theme";
import { getActionMetadata } from "../utils/logFormatter";
import { FormattedLogDetails } from "./FormattedLogDetails";

interface AuditLogGridProps {
  logs: SystemLog[];
  loading: boolean;
}

export default function AuditLogGrid({
  logs,
  loading,
}: AuditLogGridProps) {
  const columns = useMemo<GridColDef<SystemLog>[]>(
    () => [
      {
        field: "timestamp",
        headerName: "Fecha y Hora",
        width: 180,
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
          const role = params.value || "N/A";
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
        width: 200,
        renderCell: (params: GridRenderCellParams<SystemLog, string>) => {
          const meta = getActionMetadata(params.value ?? "");
          return (
            <Chip
              label={meta.label}
              size="small"
              color={meta.color}
              sx={{ fontWeight: 700, borderRadius: 1 }}
            />
          );
        },
      },
      {
        field: "details",
        headerName: "Detalles del Evento",
        flex: 1,
        minWidth: 320,
        renderCell: (params: GridRenderCellParams<SystemLog, string>) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <FormattedLogDetails details={params.value} compact />
          </Box>
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
    [],
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
