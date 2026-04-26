import { useState, useEffect, useCallback } from "react";
import { Box, IconButton, Typography, Paper, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import PageHeader from "../../components/PageHeader";
import { logService, SystemLog, LogLevel } from "../../services/logService";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../../theme/loginTheme";
import PinValidationDialog from "../../components/auth/PinValidationDialog";

const Bitacora = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const data = await logService.getLogs(500); // Traer los últimos 500
    setLogs(data);
    setLoading(false);
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    // Crear cabecera
    const headers = ["Fecha", "Usuario", "Rol", "Accion", "Detalles", "Nivel"];
    
    // Convertir logs a formato CSV
    const rows = logs.map(log => [
      format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
      log.user,
      log.role || "N/A",
      log.action,
      `"${(log.details || "").replace(/"/g, '""')}"`, // Escapar comillas en detalles
      log.level
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Crear el blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bitacora_auditoria_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchLogs();
    }
  }, [fetchLogs, isAuthorized]);

  const columns: GridColDef[] = [
    {
      field: "timestamp",
      headerName: "Fecha y Hora",
      width: 200,
      valueGetter: (params: number) => params,
      renderCell: (params: GridRenderCellParams<SystemLog, number>) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {format(params.value as number, "dd MMM yyyy, HH:mm:ss", { locale: es })}
        </Typography>
      ),
    },
    {
      field: "user",
      headerName: "Usuario",
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: "bold", color: LOGIN_COLORS.primary }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "role",
      headerName: "Rol",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value || "N/A"} 
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}
        />
      ),
    },
    {
      field: "action",
      headerName: "Acción",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value as string} 
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
    },
    {
      field: "level",
      headerName: "Nivel",
      width: 100,
      renderCell: (params: GridRenderCellParams<SystemLog, LogLevel>) => {
        const level = params.value as LogLevel;
        let color: "info" | "warning" | "error" = "info";
        if (level === "warn") color = "warning";
        if (level === "error") color = "error";
        
        return (
          <Chip 
            label={level} 
            size="small" 
            color={color}
            variant="filled"
            sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem' }}
          />
        );
      },
    },
  ];

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Bitácora de Auditoría (ISO 27001)"
        startContent={
          <IconButton 
            onClick={() => navigate("/admin")} 
            sx={{ bgcolor: "white", boxShadow: 1, mr: 2, "&:hover": { bgcolor: "grey.100" } }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
        }
        actions={
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={handleExportCSV} 
              color="primary" 
              disabled={loading || logs.length === 0}
              title="Exportar Bitácora (CSV)"
            >
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={fetchLogs} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        }
      />

      <Box sx={{ mt: 3, opacity: isAuthorized ? 1 : 0.4, pointerEvents: isAuthorized ? 'auto' : 'none' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 800 }}>
          Este registro es inmutable y cronológico. Muestra todas las acciones críticas realizadas por los usuarios, 
          permitiendo el cumplimiento de las normativas de seguridad y auditoría interna.
        </Typography>

        {isAuthorized && (
          <Paper elevation={0} sx={{ height: 650, width: "100%", borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
            <DataGrid
              rows={logs}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.timestamp + row.action} // ID temporal basado en tiempo y acción
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'rgba(0,0,0,0.02)',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
            />
          </Paper>
        )}
      </Box>

      <PinValidationDialog 
        open={showPinDialog}
        onClose={() => navigate("/admin")}
        onSuccess={() => {
          setIsAuthorized(true);
          setShowPinDialog(false);
        }}
        title="Acceso a Bitácora (Admin)"
      />
    </Box>
  );
};

export default Bitacora;
