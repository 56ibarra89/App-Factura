import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import FolderIcon from "@mui/icons-material/Folder";
import type { BackupItem, BackupType } from "../api/backupGateway";

interface BackupHistoryTableProps {
  backups: BackupItem[];
  loading: boolean;
  onDownload: (filename: string) => void;
  onRestore: (item: BackupItem) => void;
  onDelete: (item: BackupItem) => void;
}

export const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({
  backups,
  loading: _loading,
  onDownload,
  onRestore,
  onDelete,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const renderTypeChip = (type: BackupType) => {
    switch (type) {
      case "AUTOMATIC":
        return (
          <Chip
            label="Automático"
            color="primary"
            size="small"
            variant="filled"
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
          />
        );
      case "MANUAL":
        return (
          <Chip
            label="Manual"
            color="success"
            size="small"
            variant="filled"
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
          />
        );
      case "SHIFT_CLOSE":
        return (
          <Chip
            label="Cierre Caja"
            color="secondary"
            size="small"
            variant="filled"
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
          />
        );
      case "SAFETY_SNAPSHOT":
        return (
          <Chip
            label="Snapshot Seguridad"
            color="warning"
            size="small"
            variant="filled"
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
          />
        );
      default:
        return (
          <Chip
            label={type}
            size="small"
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
        );
    }
  };

  const displayedBackups = backups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "primary.50",
                color: "primary.main",
                display: "flex",
              }}
            >
              <HistoryIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Historial de Copias de Seguridad
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Auditoría completa de respaldos locales generados por el sistema
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${backups.length} registros`}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {backups.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <InsertDriveFileIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
              No hay copias de seguridad registradas
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Haz clic en "+ Crear Respaldo Ahora" para generar tu primera copia de seguridad.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Archivo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Fecha y Hora
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Tipo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Tamaño
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Ubicación
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedBackups.map((item) => (
                    <TableRow
                      key={item.filename}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <InsertDriveFileIcon
                            fontSize="small"
                            color={
                              item.type === "SAFETY_SNAPSHOT"
                                ? "warning"
                                : "action"
                            }
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ fontFamily: "monospace" }}
                          >
                            {item.filename}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell>{renderTypeChip(item.type)}</TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.sizeMb >= 1
                            ? `${item.sizeMb} MB`
                            : `${(item.sizeBytes / 1024).toFixed(1)} KB`}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {item.location === "SYNCED" || item.location === "CLOUD" ? (
                          <Chip
                            icon={<CloudDoneIcon fontSize="small" />}
                            label="Nube"
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Chip
                            icon={<FolderIcon fontSize="small" />}
                            label="Local"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </TableCell>

                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Descargar archivo">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onDownload(item.filename)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Restaurar a este punto">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onRestore(item)}
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar respaldo">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(item)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={backups.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
