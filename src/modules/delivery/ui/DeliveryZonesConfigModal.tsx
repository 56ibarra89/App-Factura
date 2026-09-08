import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useDeliveryRules } from "../hooks/useDeliveryRules";
import type { DeliveryZone, DeliveryRulesConfig } from "../model/delivery.types";

interface DeliveryZonesConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeliveryZonesConfigModal({
  open,
  onClose,
}: DeliveryZonesConfigModalProps) {
  const { rules, loading, saving, saveRules } = useDeliveryRules();

  const [activeTab, setActiveTab] = useState(0);
  const [localConfig, setLocalConfig] = useState<DeliveryRulesConfig>(rules);

  // Formulario de agregar/editar zona
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zonePrice, setZonePrice] = useState<number | string>("");
  const [zoneDriverPayout, setZoneDriverPayout] = useState<number | string>("");
  const [zoneNeighborhoods, setZoneNeighborhoods] = useState("");
  const [zoneIsActive, setZoneIsActive] = useState(true);
  const [minAmountInput, setMinAmountInput] = useState<number | string>("");

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (open) {
      setLocalConfig(rules);
      setMinAmountInput(rules.freeDeliveryMinAmount > 0 ? rules.freeDeliveryMinAmount : "");
    }
  }, [open, rules]);

  const handleOpenAddZone = () => {
    setEditingZoneId(null);
    setZoneName("");
    setZonePrice("");
    setZoneDriverPayout("");
    setZoneNeighborhoods("");
    setZoneIsActive(true);
    setZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone: DeliveryZone) => {
    setEditingZoneId(zone.id);
    setZoneName(zone.name);
    setZonePrice(zone.price === 0 ? "0" : zone.price);
    setZoneDriverPayout(zone.driverPayout === 0 ? "0" : zone.driverPayout);
    setZoneNeighborhoods((zone.neighborhoods || []).join(", "));
    setZoneIsActive(zone.isActive);
    setZoneModalOpen(true);
  };

  const handleSaveZoneItem = async () => {
    if (!zoneName.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre de la zona es obligatorio.",
        severity: "error",
      });
      return;
    }

    const neighborhoodsList = zoneNeighborhoods
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedPrice = zonePrice === "" ? 0 : Math.max(0, Number(zonePrice) || 0);
    const parsedDriverPayout =
      zoneDriverPayout === "" ? 0 : Math.max(0, Number(zoneDriverPayout) || 0);

    let updatedZones: DeliveryZone[];
    if (editingZoneId) {
      // Actualizar zona existente
      updatedZones = localConfig.zones.map((z) =>
        z.id === editingZoneId
          ? {
              ...z,
              name: zoneName.trim(),
              price: parsedPrice,
              driverPayout: parsedDriverPayout,
              neighborhoods: neighborhoodsList,
              isActive: zoneIsActive,
            }
          : z,
      );
    } else {
      // Nueva zona
      const newZone: DeliveryZone = {
        id: `zone-${Date.now()}`,
        name: zoneName.trim(),
        price: parsedPrice,
        driverPayout: parsedDriverPayout,
        neighborhoods: neighborhoodsList,
        isActive: zoneIsActive,
      };
      updatedZones = [...localConfig.zones, newZone];
    }

    const updatedConfig: DeliveryRulesConfig = {
      ...localConfig,
      zones: updatedZones,
    };
    setLocalConfig(updatedConfig);
    setZoneModalOpen(false);

    try {
      await saveRules(updatedConfig);
      setSnackbar({
        open: true,
        message: editingZoneId
          ? "Zona actualizada y guardada en el backend."
          : "Nueva zona agregada y guardada en el backend.",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Zona guardada localmente. Haz clic en 'Guardar Cambios' para sincronizar con el backend.",
        severity: "info",
      });
    }
  };

  const handleDeleteZone = async (id: string) => {
    const targetZone = localConfig.zones.find((z) => z.id === id);
    const updatedConfig: DeliveryRulesConfig = {
      ...localConfig,
      zones: localConfig.zones.filter((z) => z.id !== id),
    };
    setLocalConfig(updatedConfig);

    try {
      await saveRules(updatedConfig);
      setSnackbar({
        open: true,
        message: `Zona "${targetZone?.name || ""}" eliminada del sistema.`,
        severity: "info",
      });
    } catch {
      // ignore
    }
  };

  const handleToggleZoneStatus = async (id: string) => {
    const targetZone = localConfig.zones.find((z) => z.id === id);
    const newStatus = targetZone ? !targetZone.isActive : true;
    const updatedConfig: DeliveryRulesConfig = {
      ...localConfig,
      zones: localConfig.zones.map((z) =>
        z.id === id ? { ...z, isActive: !z.isActive } : z,
      ),
    };
    setLocalConfig(updatedConfig);

    try {
      await saveRules(updatedConfig);
      setSnackbar({
        open: true,
        message: `Zona "${targetZone?.name || ""}" ${newStatus ? "activada" : "desactivada"} en el backend.`,
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Error al actualizar estado en el backend. Pulsa 'Guardar Cambios'.",
        severity: "error",
      });
    }
  };

  const handleSaveAllConfig = async () => {
    try {
      await saveRules(localConfig);
      setSnackbar({
        open: true,
        message: "Zonas y reglas de delivery guardadas exitosamente en el backend.",
        severity: "success",
      });
      setTimeout(() => {
        onClose();
      }, 600);
    } catch {
      setSnackbar({
        open: true,
        message: "Error al guardar la configuración en el backend.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={!saving ? onClose : undefined}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            py: 2,
            px: 3,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
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
              <TwoWheelerIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Zonas y Reglas de Delivery
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configura tarifas por sector geográfico, compensación a repartidores y envío gratis
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50", px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<LocationOnIcon fontSize="small" />}
              iconPosition="start"
              label="Zonas de Cobertura"
              sx={{ textTransform: "none", fontWeight: 700, minHeight: 48 }}
            />
            <Tab
              icon={<LocalShippingIcon fontSize="small" />}
              iconPosition="start"
              label="Regla de Envío Gratis"
              sx={{ textTransform: "none", fontWeight: 700, minHeight: 48 }}
            />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 3, minHeight: 380 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : activeTab === 0 ? (
            /* Pestaña 1: Zonas de Entrega */
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Define los sectores de entrega con su tarifa cobrada al cliente y el flete pagado al motorizado.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddLocationAltIcon />}
                  onClick={handleOpenAddZone}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Nueva Zona
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 700 }}>Zona / Sector</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tarifa Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pago Motorizado</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Barrios / Colonias</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {localConfig.zones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6, px: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: "50%",
                                bgcolor: "primary.50",
                                color: "primary.main",
                                display: "flex",
                              }}
                            >
                              <LocationOnIcon sx={{ fontSize: 36 }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                              No hay zonas de delivery configuradas
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ maxWidth: 460 }}
                            >
                              Registra las zonas o sectores de tu ciudad con la tarifa que cobrarás al cliente y el pago que liquidarás a tus motorizados.
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<AddLocationAltIcon />}
                              onClick={handleOpenAddZone}
                              sx={{
                                mt: 1,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                px: 2.5,
                              }}
                            >
                              Registrar Primera Zona
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      localConfig.zones.map((zone) => (
                        <TableRow key={zone.id} hover>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <LocationOnIcon fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={700}>
                                {zone.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              C$ {zone.price.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              C$ {zone.driverPayout.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>
                            {zone.neighborhoods && zone.neighborhoods.length > 0 ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {zone.neighborhoods.map((nb, i) => (
                                  <Chip key={i} label={nb} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin referencias
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
                              <Switch
                                size="small"
                                color="success"
                                checked={zone.isActive}
                                onChange={() => handleToggleZoneStatus(zone.id)}
                                inputProps={{ "aria-label": `Activar o desactivar ${zone.name}` }}
                              />
                              <Chip
                                label={zone.isActive ? "Activa" : "Inactiva"}
                                color={zone.isActive ? "success" : "default"}
                                size="small"
                                variant={zone.isActive ? "filled" : "outlined"}
                                sx={{ fontWeight: 700, fontSize: "0.75rem", minWidth: 62 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Editar Zona">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditZone(zone)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar Zona">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteZone(zone.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            /* Pestaña 2: Regla de Envío Gratis */
            <Box sx={{ maxWidth: 620, mx: "auto", py: 2 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LocalShippingIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        Envío Gratis por Consumo Mínimo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aplica flete de C$ 0.00 automáticamente cuando la comanda supere el umbral
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={localConfig.freeDeliveryEnabled ? "Activado" : "Desactivado"}
                      color={localConfig.freeDeliveryEnabled ? "primary" : "default"}
                      size="small"
                      variant={localConfig.freeDeliveryEnabled ? "filled" : "outlined"}
                      sx={{ fontWeight: 700 }}
                    />
                    <Switch
                      checked={localConfig.freeDeliveryEnabled}
                      onChange={(e) =>
                        setLocalConfig((prev) => ({
                          ...prev,
                          freeDeliveryEnabled: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Monto Mínimo de Compra en Productos (C$):
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    disabled={!localConfig.freeDeliveryEnabled}
                    value={minAmountInput}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMinAmountInput(val);
                      setLocalConfig((prev) => ({
                        ...prev,
                        freeDeliveryMinAmount: val === "" ? 0 : Math.max(0, Number(val) || 0),
                      }));
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: "flex", alignItems: "center", mr: 1, color: "text.secondary" }}>
                          <AttachMoneyIcon fontSize="small" />
                          <Typography variant="body2" fontWeight={700}>
                            C$
                          </Typography>
                        </Box>
                      ),
                    }}
                    sx={{ width: 200 }}
                  />
                </Box>
              </Paper>

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Garantía de Liquidación al Repartidor
                </Typography>
                <Typography variant="caption">
                  Al bonificar el flete como "Envío Gratis" para el cliente, el sistema conservará intacto el registro del flete asignado al repartidor según la zona para que su pago no se vea afectado en la liquidación diaria.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} disabled={saving} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveAllConfig}
            variant="contained"
            color="primary"
            disabled={saving || loading}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3 }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Secundario: Crear / Editar Zona */}
      <Dialog
        open={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            {editingZoneId ? "Editar Zona de Entrega" : "Nueva Zona de Entrega"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre de la Zona"
            placeholder="ej: Zona 1 - Casco Urbano"
            size="small"
            fullWidth
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            required
            sx={{ mt: 1 }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Tarifa Cliente (C$)"
              type="number"
              size="small"
              fullWidth
              value={zonePrice}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setZonePrice(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" sx={{ mr: 0.5, color: "text.secondary" }}>
                    C$
                  </Typography>
                ),
              }}
            />

            <TextField
              label="Pago Motorizado (C$)"
              type="number"
              size="small"
              fullWidth
              value={zoneDriverPayout}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => setZoneDriverPayout(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" sx={{ mr: 0.5, color: "text.secondary" }}>
                    C$
                  </Typography>
                ),
              }}
            />
          </Box>

          <TextField
            label="Barrios / Colonias Sugeridas"
            placeholder="Centro, San Juan, El Calvario (separados por coma)"
            multiline
            rows={2}
            size="small"
            fullWidth
            value={zoneNeighborhoods}
            onChange={(e) => setZoneNeighborhoods(e.target.value)}
            helperText="Escribe los barrios separados por coma para guiar al cajero"
          />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Zona Activa para Envíos
            </Typography>
            <Switch
              checked={zoneIsActive}
              onChange={(e) => setZoneIsActive(e.target.checked)}
              color="primary"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setZoneModalOpen(false)}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveZoneItem}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5 }}
          >
            {editingZoneId ? "Actualizar Zona" : "Agregar Zona"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
