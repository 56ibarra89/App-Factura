import React from "react";
import { Box, Typography, Paper, Badge, Stack } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Order, OrderStatus } from "../../model/order.types";
import { requiresKitchenPreparation } from "../../model/orderItemDomain";
import type { Kitchen } from "../../../kitchens";
import { KdsCard } from "./KdsCard";

interface KdsKanbanBoardProps {
  orders: readonly Order[];
  selectedKitchenId: string;
  kitchens: Kitchen[];
  resolveTableName?: (tableId: string) => string;
  onUpdateStatus: (
    id: string,
    status: OrderStatus,
    cancelReason?: string,
    adminPin?: string,
    sentAt?: number,
    kitchenId?: string,
    itemId?: number | string
  ) => void;
}

export const KdsKanbanBoard: React.FC<KdsKanbanBoardProps> = ({
  orders,
  selectedKitchenId,
  kitchens,
  resolveTableName,
  onUpdateStatus,
}) => {

  const getOrderEffectiveStatus = React.useCallback(
    (order: Order): OrderStatus => {
      const relevantItems = selectedKitchenId
        ? order.items.filter(
            (i) =>
              i.kitchenId === selectedKitchenId &&
              requiresKitchenPreparation(i)
          )
        : order.items.filter(requiresKitchenPreparation);

      if (relevantItems.length === 0) return order.status;

      const allDelivered = relevantItems.every(
        (i) => i.kitchenStatus === "delivered"
      );
      if (allDelivered) return "delivered";

      const allReadyOrDelivered = relevantItems.every(
        (i) => i.kitchenStatus === "ready" || i.kitchenStatus === "delivered"
      );
      if (allReadyOrDelivered) return "ready";

      const anyPreparingOrReady = relevantItems.some(
        (i) => i.kitchenStatus === "preparing" || i.kitchenStatus === "ready"
      );
      if (anyPreparingOrReady) return "preparing";

      return "pending";
    },
    [selectedKitchenId]
  );

  const filteredOrders = React.useMemo(() => {
    if (!selectedKitchenId) return orders;
    return orders.filter((order) =>
      order.items.some(
        (item) =>
          requiresKitchenPreparation(item) &&
          item.kitchenId === selectedKitchenId,
      )
    );
  }, [orders, selectedKitchenId]);

  const { pendingOrders, preparingOrders, readyOrders } = React.useMemo(() => {
    const pending: Order[] = [];
    const preparing: Order[] = [];
    const ready: Order[] = [];

    filteredOrders.forEach((o) => {
      const effectiveStatus = getOrderEffectiveStatus(o);
      if (effectiveStatus === "pending") {
        pending.push(o);
      } else if (effectiveStatus === "preparing") {
        preparing.push(o);
      } else if (effectiveStatus === "ready") {
        ready.push(o);
      }
    });

    return { pendingOrders: pending, preparingOrders: preparing, readyOrders: ready };
  }, [filteredOrders, getOrderEffectiveStatus]);

  const columns = [
    {
      title: "PENDIENTES",
      icon: <HourglassTopIcon sx={{ color: "#ffb74d" }} />,
      count: pendingOrders.length,
      orders: pendingOrders,
      headerBg: "rgba(255, 183, 77, 0.12)",
      borderColor: "#ffb74d",
    },
    {
      title: "EN PREPARACIÓN",
      icon: <RestaurantIcon sx={{ color: "#64b5f6" }} />,
      count: preparingOrders.length,
      orders: preparingOrders,
      headerBg: "rgba(100, 181, 246, 0.12)",
      borderColor: "#64b5f6",
    },
    {
      title: "LISTAS",
      icon: <CheckCircleIcon sx={{ color: "#81c784" }} />,
      count: readyOrders.length,
      orders: readyOrders,
      headerBg: "rgba(129, 199, 132, 0.12)",
      borderColor: "#81c784",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 3,
        width: "100%",
        alignItems: "start",
      }}
    >
      {columns.map((col, idx) => (
        <Paper
          key={idx}
          elevation={2}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            border: `1px solid ${col.borderColor}`,
            overflow: "hidden",
            minHeight: "75vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Encabezado de Columna */}
          <Box
            sx={{
              p: 2,
              bgcolor: col.headerBg,
              borderBottom: `2px solid ${col.borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {col.icon}
              <Typography variant="h6" fontWeight="900" sx={{ color: "text.primary", letterSpacing: "0.5px" }}>
                {col.title}
              </Typography>
            </Stack>

            <Badge
              badgeContent={col.count}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: col.borderColor,
                  color: "#000000",
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  height: 24,
                  minWidth: 24,
                  borderRadius: "12px",
                },
              }}
            />
          </Box>

          {/* Lista de tarjetas en la columna */}
          <Stack spacing={2.5} p={2} sx={{ flexGrow: 1, overflowY: "auto" }}>
            {col.orders.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  opacity: 0.6,
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Sin órdenes en esta etapa
                </Typography>
              </Box>
            ) : (
              col.orders.map((order) => {
                const itemsForKitchen = selectedKitchenId
                  ? order.items.filter((i) => i.kitchenId === selectedKitchenId)
                  : undefined;

                return (
                  <KdsCard
                    key={order.id}
                    order={order}
                    filteredItems={itemsForKitchen}
                    kitchens={kitchens}
                    resolveTableName={resolveTableName}
                    onUpdateStatus={onUpdateStatus}
                  />
                );
              })
            )}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
};

