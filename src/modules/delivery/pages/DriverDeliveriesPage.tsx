import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import RefreshIcon from "@mui/icons-material/Refresh";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PaymentsIcon from "@mui/icons-material/Payments";
import { useAuth } from "../../auth";
import { deliveryGateway } from "../api/deliveryGateway";
import { PaymentConfirmationDialog } from "../ui/PaymentConfirmationDialog";
import {
  statusLabels,
  statusColors,
  ordersGateway,
  requiresKitchenPreparation,
  type Order,
} from "../../orders";
import { customerRepository, type Customer } from "../../customers";
import { usersGateway, type UserAccount } from "../../accounts";

export default function DriverDeliveriesPage() {
  const { role, username } = useAuth();

  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabFilter, setTabFilter] = useState<"pending" | "delivered" | "all">(
    "pending"
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  const isMotorizado = role === "motorizado";

  const isOrderReadyForDelivery = (order: Order) => {
    const sentItems = order.items.filter(
      (item) => requiresKitchenPreparation(item) && item.isSentToKitchen
    );
    if (sentItems.length === 0) return true;
    return (
      order.status === "ready" ||
      order.status === "delivered" ||
      order.status === "paid" ||
      sentItems.every(
        (i) => i.kitchenStatus === "ready" || i.kitchenStatus === "delivered"
      )
    );
  };

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersList, customersList] = await Promise.all([
        usersGateway.list().catch(() => [] as UserAccount[]),
        customerRepository.getAll().catch(() => [] as Customer[]),
      ]);

      setAllUsers(usersList);
      setCustomers(customersList);

      const motorizados = usersList.filter((u) => u.role === "motorizado");
      setDrivers(motorizados.length > 0 ? motorizados : usersList);

      if (isMotorizado) {
        const myUser = usersList.find(
          (u) => u.username.toLowerCase() === (username || "").toLowerCase()
        );
        if (myUser) {
          setSelectedDriverId(myUser.id);
        } else if (motorizados.length > 0) {
          setSelectedDriverId(motorizados[0].id);
        }
      } else if (!selectedDriverId && motorizados.length > 0) {
        setSelectedDriverId(motorizados[0].id);
      }
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      setSnackbar({
        open: true,
        message: "Error al cargar la información de motorizados.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [isMotorizado, selectedDriverId, username]);

  const fetchAllDeliveryOrders = useCallback(async () => {
    try {
      const [allCurrentOrders, driverOrders] = await Promise.all([
        ordersGateway.listCurrent().catch(() => [] as Order[]),
        selectedDriverId
          ? deliveryGateway
              .getDriverOrdersToday(selectedDriverId)
              .catch(() => [] as Order[])
          : Promise.resolve([] as Order[]),
      ]);

      const orderMap = new Map<string, Order>();

      driverOrders.forEach((order) => {
        orderMap.set(order.id, order);
      });

      allCurrentOrders.forEach((order) => {
        if (order.orderType === "delivery") {
          orderMap.set(order.id, order);
        }
      });

      const combined = Array.from(orderMap.values());

      combined.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setOrders(combined);
    } catch (err) {
      console.error("Error cargando pedidos de delivery:", err);
      setSnackbar({
        open: true,
        message: "Error al sincronizar pedidos de delivery.",
        severity: "error",
      });
    }
  }, [selectedDriverId]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    void fetchAllDeliveryOrders();

    const interval = setInterval(() => {
      void fetchAllDeliveryOrders();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchAllDeliveryOrders]);

  const getCustomerPhone = useCallback(
    (customerName?: string) => {
      if (!customerName) return null;
      const match = customers.find(
        (c) => c.name.toLowerCase() === customerName.toLowerCase(),
      );
      return match?.phone || null;
    },
    [customers],
  );

  const handleMarkAsDelivered = async (order: Order) => {
    if (!isOrderReadyForDelivery(order)) {
      setSnackbar({
        open: true,
        message: "El pedido aún no está listo en cocina para ser entregado.",
        severity: "warning",
      });
      return;
    }
    try {
      await ordersGateway.updateStatus({
        orderId: order.id,
        status: "delivered",
      });
      setSnackbar({
        open: true,
        message: `Pedido #${order.invoiceNumber || order.id.slice(-6)} marcado como Entregado.`,
        severity: "success",
      });
      await fetchAllDeliveryOrders();
    } catch (err: unknown) {
      console.error("Error al marcar como entregado:", err);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (err instanceof Error ? err.message : undefined) ||
        "No se pudo actualizar el estado del pedido.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleMarkAsPaid = (order: Order) => {
    setPayingOrder(order);
  };

  const handleConfirmPayment = async (
    payments: { method: string; amount: number }[],
    paymentMethodLabel: string,
  ) => {
    if (!payingOrder) return;
    try {
      await deliveryGateway.finalizeOrder(
        payingOrder.id,
        paymentMethodLabel,
        payingOrder.total,
        undefined,
        payments,
      );
      setSnackbar({
        open: true,
        message: `Pedido #${payingOrder.invoiceNumber || payingOrder.id.slice(-6)} liquidado con éxito (${paymentMethodLabel}).`,
        severity: "success",
      });
      setPayingOrder(null);
      await fetchAllDeliveryOrders();
    } catch (err) {
      console.error("Error al finalizar pago:", err);
      setSnackbar({
        open: true,
        message: "No se pudo registrar el pago del pedido.",
        severity: "error",
      });
      throw err;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${label} copiado al portapapeles.`,
      severity: "info",
    });
  };

  // Identificar el motorizado seleccionado y su username
  const selectedDriverUser = useMemo(() => {
    return allUsers.find(
      (u) =>
        u.id === selectedDriverId ||
        u.username.toLowerCase() === selectedDriverId.toLowerCase()
    );
  }, [allUsers, selectedDriverId]);

  const selectedDriverName = useMemo(() => {
    if (selectedDriverUser) {
      return `${selectedDriverUser.firstName} ${selectedDriverUser.lastName}`.trim() || selectedDriverUser.username;
    }
    if (username) return username;
    return "Motorizado";
  }, [selectedDriverUser, username]);

  // Filtrar las órdenes para el motorizado activo o vista general
  const driverOrders = useMemo(() => {
    return orders.filter((order) => {
      // Si el usuario es motorizado, ve las órdenes asignadas a su id, username, nombre completo o entregas delivery
      if (isMotorizado) {
        const myUserId = selectedDriverUser?.id || selectedDriverId;
        const myUsername = username?.toLowerCase();
        const myFullName = selectedDriverUser
          ? `${selectedDriverUser.firstName} ${selectedDriverUser.lastName}`.trim().toLowerCase()
          : "";

        const orderDriver = (order.driverId || "").toLowerCase();

        const matchId = Boolean(myUserId && order.driverId === myUserId);
        const matchUser = Boolean(myUsername && orderDriver === myUsername);
        const matchFullName = Boolean(myFullName && orderDriver === myFullName);
        const unassignedDelivery = !order.driverId && order.orderType === "delivery";

        return matchId || matchUser || matchFullName || unassignedDelivery;
      }

      // Si es admin/cajero/despachador:
      if (!selectedDriverId || selectedDriverId === "all") {
        return true;
      }

      const matchId = order.driverId === selectedDriverId;
      const matchUser =
        selectedDriverUser &&
        order.driverId?.toLowerCase() === selectedDriverUser.username.toLowerCase();

      return matchId || matchUser;
    });
  }, [orders, isMotorizado, selectedDriverUser, username, selectedDriverId]);

  // Filtrado final de órdenes por pestañas (Pendientes / Entregados) y búsqueda por texto
  const filteredOrders = useMemo(() => {
    return driverOrders.filter((order) => {
      // Filtro por Pestaña / Estado
      if (tabFilter === "pending") {
        if (order.status === "delivered" || order.status === "paid") {
          return false;
        }
      } else if (tabFilter === "delivered") {
        if (order.status !== "delivered" && order.status !== "paid") {
          return false;
        }
      }

      // Filtro por Texto de Búsqueda
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const invoiceMatch = (order.invoiceNumber || order.id)
          .toLowerCase()
          .includes(query);
        const nameMatch = (order.customerName || "")
          .toLowerCase()
          .includes(query);
        const addressMatch = (order.customerAddress || "")
          .toLowerCase()
          .includes(query);
        const phoneMatch = (
          order.customerPhone ||
          getCustomerPhone(order.customerName) ||
          ""
        ).includes(query);
        const itemsMatch = order.items.some((i) =>
          i.name.toLowerCase().includes(query)
        );

        if (
          !invoiceMatch &&
          !nameMatch &&
          !addressMatch &&
          !phoneMatch &&
          !itemsMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [driverOrders, tabFilter, searchTerm, getCustomerPhone]);

  // Cálculos de liquidación del motorizado
  const completedOrders = useMemo(
    () => driverOrders.filter((o) => o.status === "delivered" || o.status === "paid"),
    [driverOrders]
  );
  const pendingOrdersCount = useMemo(
    () =>
      driverOrders.filter((o) => o.status !== "delivered" && o.status !== "paid")
        .length,
    [driverOrders]
  );
  const totalRevenue = useMemo(
    () => completedOrders.reduce((acc, o) => acc + o.total, 0),
    [completedOrders]
  );
  const totalChangeGiven = useMemo(
    () => completedOrders.reduce((acc, o) => acc + (o.deliveryChange || 0), 0),
    [completedOrders]
  );

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
      }}
    >
      <PageHeader
        title="Entregas de Motorizados"
        startContent={<BackButton to="/home" />}
        actions={
          <Tooltip title="Actualizar pedidos">
            <IconButton
              onClick={() => {
                void fetchAllDeliveryOrders();
              }}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <RefreshIcon color="primary" />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Barra de Selección de Motorizado y Resumen */}
      <Paper
        elevation={3}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1,
              px: 2,
              borderRadius: 2,
              bgcolor: "rgba(211, 47, 47, 0.08)",
              color: "error.main",
            }}
          >
            <TwoWheelerIcon fontSize="medium" />
            <Typography variant="subtitle1" fontWeight="800">
              {isMotorizado ? `Mis Entregas: ${selectedDriverName}` : "Control de Entregas"}
            </Typography>
          </Box>

          {!isMotorizado && (
            <TextField
              select
              size="small"
              label="Seleccionar Motorizado"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="all">
                <em>Todos los Motorizados</em>
              </MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.firstName} {d.lastName} ({d.username})
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        {/* Resumen Rápido de Entregas */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<DirectionsBikeIcon />}
            label={`${pendingOrdersCount} Por Entregar`}
            color={pendingOrdersCount > 0 ? "warning" : "default"}
            sx={{ fontWeight: "bold" }}
          />
          <Chip
            icon={<CheckCircleIcon />}
            label={`${completedOrders.length} Entregados`}
            color="success"
            sx={{ fontWeight: "bold" }}
          />
        </Stack>
      </Paper>

      {/* Barra de Búsqueda y Pestañas de Estado */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
        }}
      >
        <Tabs
          value={tabFilter}
          onChange={(_, val) => setTabFilter(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { bgcolor: "error.main" },
            "& .MuiTab-root.Mui-selected": { color: "error.main" },
          }}
        >
          <Tab
            value="pending"
            label={`Pendientes (${pendingOrdersCount})`}
            sx={{ fontWeight: "bold", textTransform: "none", minHeight: 40 }}
          />
          <Tab
            value="delivered"
            label={`Entregados (${completedOrders.length})`}
            sx={{ fontWeight: "bold", textTransform: "none", minHeight: 40 }}
          />
          <Tab
            value="all"
            label={`Todos (${driverOrders.length})`}
            sx={{ fontWeight: "bold", textTransform: "none", minHeight: 40 }}
          />
        </Tabs>

        <TextField
          size="small"
          placeholder="Buscar por cliente, dirección, teléfono o plato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: { sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Paper>

      {/* Grid de Pedidos para el Motorizado */}
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <CircularProgress color="error" size={36} sx={{ mb: 2 }} />
          <Typography color="text.secondary">Cargando pedidos de entrega...</Typography>
        </Box>
      ) : filteredOrders.length > 0 ? (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={3}
        >
          {filteredOrders.map((order) => {
            const customerPhone =
              order.customerPhone || getCustomerPhone(order.customerName);
            const isCompleted =
              order.status === "delivered" || order.status === "paid";

            return (
              <Card
                key={order.id}
                elevation={4}
                sx={{
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  border: "2px solid",
                  borderColor: isCompleted
                    ? "success.main"
                    : order.status === "ready"
                    ? "primary.main"
                    : "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                {/* Encabezado del Ticket */}
                <Box
                  sx={{
                    p: 2,
                    pb: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="900" color="text.primary">
                      {order.invoiceNumber ? `#${order.invoiceNumber}` : `ID: ${order.id.slice(-6)}`}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: "0.85rem", color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Stack>
                  </Box>

                  <Chip
                    label={statusLabels[order.status] || order.status}
                    color={statusColors[order.status] || "default"}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Datos del Cliente */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: "background.default",
                    }}
                  >
                    <Stack spacing={1}>
                      {/* Nombre */}
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                          {order.customerName || "Cliente No Especificado"}
                        </Typography>
                      </Box>

                      {/* Teléfono */}
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon color="action" fontSize="small" />
                          <Typography variant="body2" fontWeight="600">
                            {customerPhone ? (
                              <Box
                                component="a"
                                href={`tel:${customerPhone}`}
                                sx={{
                                  color: "primary.main",
                                  textDecoration: "none",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {customerPhone}
                              </Box>
                            ) : (
                              <Typography component="span" variant="body2" color="text.secondary">
                                Sin teléfono registrado
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                        {customerPhone && (
                          <Tooltip title="Copiar teléfono">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(customerPhone, "Teléfono")}
                            >
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Dirección */}
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                        <Box display="flex" alignItems="flex-start" gap={1} flex={1}>
                          <LocationOnIcon color="error" fontSize="small" sx={{ mt: 0.2 }} />
                          <Typography variant="body2" color="text.primary" fontWeight="500">
                            {order.customerAddress || "Sin dirección especificada"}
                          </Typography>
                        </Box>
                        {order.customerAddress && (
                          <Tooltip title="Copiar dirección">
                            <IconButton
                              size="small"
                              onClick={() =>
                                copyToClipboard(order.customerAddress!, "Dirección")
                              }
                            >
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Desglose de Productos */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <RestaurantMenuIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Productos a Entregar:
                      </Typography>
                    </Box>
                    <Stack spacing={0.8} sx={{ pl: 1 }}>
                      {order.items.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight="700">
                              {item.quantity}x {item.name}
                            </Typography>
                            {item.extras && item.extras.length > 0 && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                + {item.extras.map((e) => e.name).join(", ")}
                              </Typography>
                            )}
                            {item.note && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                                fontWeight="bold"
                                display="block"
                              >
                                Nota: {item.note}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            C${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Método de Pago:
                      </Typography>
                      {(() => {
                        const method = (order.paymentMethod || "EFECTIVO").toUpperCase();
                        if (method === "MIXTO") {
                          return (
                            <Chip
                              label="Mixto"
                              size="small"
                              color="info"
                              sx={{ fontWeight: "bold" }}
                            />
                          );
                        }
                        if (method === "TARJETA") {
                          return (
                            <Chip
                              label="Tarjeta"
                              size="small"
                              color="secondary"
                              sx={{ fontWeight: "bold" }}
                            />
                          );
                        }
                        if (method === "APP") {
                          return (
                            <Chip
                              label="App"
                              size="small"
                              color="warning"
                              sx={{ fontWeight: "bold" }}
                            />
                          );
                        }
                        return (
                          <Chip
                            label="Efectivo"
                            size="small"
                            color="success"
                            sx={{ fontWeight: "bold" }}
                          />
                        );
                      })()}
                    </Box>

                    {order.paymentMethod === "MIXTO" && order.splitAmounts && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                        sx={{
                          p: 0.8,
                          borderRadius: 1,
                          bgcolor: "rgba(2, 136, 209, 0.08)",
                          border: "1px dashed rgba(2, 136, 209, 0.3)",
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" color="info.main">
                          Efectivo: C${(order.splitAmounts.efectivo || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color="info.main">
                          Tarjeta: C${(order.splitAmounts.tarjeta || 0).toFixed(2)}
                        </Typography>
                        {order.splitAmounts.app !== undefined && order.splitAmounts.app > 0 && (
                          <Typography variant="caption" fontWeight="bold" color="info.main">
                            App: C${order.splitAmounts.app.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        TOTAL A COBRAR:
                      </Typography>
                      <Typography variant="h6" fontWeight="900" color="primary.main">
                        C${order.total.toFixed(2)}
                      </Typography>
                    </Box>

                    {order.customerTendered !== undefined && order.customerTendered > 0 && (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Cliente Paga Con:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          C${order.customerTendered.toFixed(2)}
                        </Typography>
                      </Box>
                    )}

                    {order.deliveryChange !== undefined && order.deliveryChange > 0 && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={0.5}
                        sx={{
                          p: 0.8,
                          borderRadius: 1,
                          bgcolor: "rgba(211, 47, 47, 0.1)",
                          color: "error.main",
                        }}
                      >
                        <Typography variant="body2" fontWeight="800">
                          VUELTO A ENTREGAR:
                        </Typography>
                        <Typography variant="body1" fontWeight="900">
                          C${order.deliveryChange.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                {}
                <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
                  {order.status !== "delivered" && order.status !== "paid" ? (
                    (() => {
                      const isReady = isOrderReadyForDelivery(order);
                      const buttonContent = (
                        <Button
                          fullWidth
                          variant="contained"
                          color={isReady ? "error" : "inherit"}
                          size="large"
                          disabled={!isReady}
                          startIcon={isReady ? <CheckCircleIcon /> : <AccessTimeIcon />}
                          onClick={() => handleMarkAsDelivered(order)}
                          sx={{
                            fontWeight: "bold",
                            py: 1,
                            ...(!isReady && {
                              bgcolor: "action.disabledBackground",
                              color: "text.disabled",
                            }),
                          }}
                        >
                          {isReady ? "Recibido de cocina" : "Pendiente en Cocina"}
                        </Button>
                      );

                      return !isReady ? (
                        <Tooltip
                          title="El pedido aún está en preparación en cocina. Espera a que cocina lo marque como listo."
                          arrow
                          placement="top"
                          sx={{ width: "100%" }}
                        >
                          <span style={{ width: "100%", display: "block" }}>
                            {buttonContent}
                          </span>
                        </Tooltip>
                      ) : (
                        buttonContent
                      );
                    })()
                  ) : order.status === "delivered" ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<PaymentsIcon />}
                      onClick={() => handleMarkAsPaid(order)}
                      sx={{ fontWeight: "bold", py: 1 }}
                    >
                      Cobrar / Liquidar Pedido
                    </Button>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                      width="100%"
                      py={1}
                      color="success.main"
                    >
                      <CheckCircleIcon fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Pedido Completado y Liquidado
                      </Typography>
                    </Box>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <TwoWheelerIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            No hay pedidos para mostrar
          </Typography>
          <Typography color="text.secondary">
            {tabFilter === "pending"
              ? "No tienes pedidos pendientes de entrega en este momento."
              : "No se encontraron pedidos con el filtro actual."}
          </Typography>
        </Paper>
      )}

      {}
      {completedOrders.length > 0 && (
        <Paper
          elevation={6}
          sx={{
            mt: 4,
            p: 2.5,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <AttachMoneyIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Resumen de Caja del Motorizado ({selectedDriverName})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completedOrders.length} entregas realizadas el día de hoy
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={3} justifyContent="flex-end">
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Total Recaudado (Efectivo)
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="900">
                C${totalRevenue.toFixed(2)}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Vueltos Entregados
              </Typography>
              <Typography variant="h6" color="error.main" fontWeight="900">
                C${totalChangeGiven.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", fontWeight: "bold" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PaymentConfirmationDialog
        open={Boolean(payingOrder)}
        order={payingOrder}
        onClose={() => setPayingOrder(null)}
        onConfirm={handleConfirmPayment}
      />
    </Box>
  );
}

