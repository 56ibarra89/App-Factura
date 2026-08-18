import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { Order, OrderStatus } from "../../model/order.types";
import {
  isPackagingOrderItem,
  requiresKitchenPreparation,
} from "../../model/orderItemDomain";
import type { Kitchen } from "../../../kitchens";
import { getTicketUrgency } from "../../utils/timeUrgency";
import { formatItemName, formatTableName } from "../../../../shared/format";
import { LOGIN_COLORS } from "../../../../shared/theme";

interface KdsCardProps {
  order: Order;
  filteredItems?: Order["items"];
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

export const KdsCard: React.FC<KdsCardProps> = ({
  order,
  filteredItems,
  kitchens,
  resolveTableName,
  onUpdateStatus,
}) => {
  const itemsToUse = filteredItems || order.items;
  const hasPackaging = order.items.some(isPackagingOrderItem);
  const displayItems = itemsToUse.filter(requiresKitchenPreparation);

  const ticketSentAt = displayItems.find((i) => i.isSentToKitchen)?.sentAt || order.timestamp;
  const sentAtTimestampMs = ticketSentAt ? new Date(ticketSentAt).getTime() : undefined;
  const urgency = getTicketUrgency(ticketSentAt);
  const isTakeout = !order.tableId && order.orderType !== "delivery";

  return (
    <Card
      elevation={4}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        bgcolor: "background.paper",
        color: "text.primary",
        border: "2px solid",
        borderColor: urgency.isPulsing ? urgency.color : "divider",
        boxShadow: urgency.isPulsing
          ? "0 0 20px rgba(211, 47, 47, 0.4)"
          : "0 4px 16px rgba(0,0,0,0.06)",
        transition: "all 0.3s ease-in-out",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Barra superior de urgencia de tiempo (Semáforo) */}
      <Box
        sx={{
          bgcolor: urgency.badgeBg,
          borderBottom: `2px solid ${urgency.badgeBorder}`,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animation: urgency.isPulsing ? "pulseBorder 1.5s infinite ease-in-out" : "none",
          "@keyframes pulseBorder": {
            "0%": { opacity: 0.7 },
            "50%": { opacity: 1 },
            "100%": { opacity: 0.7 },
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TimerIcon sx={{ color: urgency.textColor, fontSize: "1.2rem" }} />
          <Typography
            variant="subtitle2"
            fontWeight="800"
            sx={{ color: urgency.textColor, fontSize: "0.95rem" }}
          >
            {urgency.label}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
          {new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Encabezado del ticket */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box>
            <Typography variant="h5" fontWeight="900" color="text.primary" sx={{ letterSpacing: "-0.5px" }}>
              {order.invoiceNumber ? `#${order.invoiceNumber}` : "Orden en Curso"}
            </Typography>

            <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
              {order.customerName && (
                <Chip
                  label={order.customerName}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                />
              )}
              {order.tableId && (
                <Chip
                  label={
                    resolveTableName?.(order.tableId) ??
                    formatTableName(order.tableId, [])
                  }
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                />
              )}
              {isTakeout && (
                <Chip
                  icon={<TakeoutDiningIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label="Para Llevar"
                  size="small"
                  color="info"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              )}
              {hasPackaging && (
                <Chip
                  icon={<LocalShippingIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label={order.tableId ? "Solicitó Empaque" : "Requiere Empaque"}
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              )}
              {order.orderType === "delivery" && (
                <Chip
                  icon={<TwoWheelerIcon sx={{ fontSize: "0.9rem !important" }} />}
                  label="Delivery"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: "divider" }} />

        {/* Lista de Ítems */}
        <Stack spacing={1.5}>
          {displayItems.map((item, idx) => {
            const kitchenName = kitchens.find((k) => k.id === item.kitchenId)?.name || "Sin área";
            const status = item.kitchenStatus || order.status;

            return (
              <Box
                key={idx}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: item.note ? "rgba(255, 193, 7, 0.12)" : "action.hover",
                  border: "1px solid",
                  borderColor: item.note ? "#ffc107" : "divider",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body1"
                      fontWeight="800"
                      color="text.primary"
                      sx={{
                        fontSize: "0.98rem",
                        lineHeight: 1.25,
                        wordBreak: "break-word",
                      }}
                    >
                      <Box component="span" sx={{ color: LOGIN_COLORS.primary, fontWeight: 900, mr: 0.5 }}>
                        {item.quantity}x
                      </Box>
                      {formatItemName(item.name, item.size)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", display: "block", mt: 0.3 }}>
                      📍 {kitchenName}
                    </Typography>
                  </Box>

                  {/* Acciones Táctiles Grandes */}
                  <Box sx={{ flexShrink: 0 }}>
                    {status === "pending" && (
                      <Button
                        size="medium"
                        variant="contained"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "preparing",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            item.kitchenId,
                            item.id
                          )
                        }
                        startIcon={<RestaurantIcon />}
                        sx={{
                          bgcolor: LOGIN_COLORS.primary,
                          "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                          fontWeight: 800,
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        PREPARAR
                      </Button>
                    )}
                    {status === "preparing" && (
                      <Button
                        size="medium"
                        variant="contained"
                        color="success"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "ready",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            item.kitchenId,
                            item.id
                          )
                        }
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          fontWeight: 800,
                          px: 2,
                          py: 0.8,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        LISTO
                      </Button>
                    )}
                    {status === "ready" && (
                      <Button
                        size="medium"
                        variant="outlined"
                        color="info"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "delivered",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            item.kitchenId,
                            item.id
                          )
                        }
                        sx={{
                          fontWeight: 800,
                          px: 1.5,
                          py: 0.8,
                          borderRadius: 2,
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ENTREGAR
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Nota especial destacada */}
                {item.note && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 0.8,
                      bgcolor: "rgba(255, 193, 7, 0.15)",
                      borderRadius: 1.5,
                      borderLeft: "4px solid #ffc107",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <WarningAmberIcon sx={{ color: "#ffc107", fontSize: "1rem" }} />
                    <Typography variant="caption" fontWeight="700" color="text.primary">
                      NOTA: {item.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};
