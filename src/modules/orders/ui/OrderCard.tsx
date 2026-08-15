import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimerIcon from "@mui/icons-material/Timer";
import { Order, OrderStatus } from "../model/order.types";
import { LOGIN_COLORS } from "../../../shared/theme";
import { formatItemName, formatTableName } from "../../../shared/format";
import type { Kitchen } from "../../kitchens";
import { getTicketUrgency } from "../utils/timeUrgency";
import {
  isPackagingOrderItem,
  requiresKitchenPreparation,
} from "../model/orderItemDomain";

interface OrderCardProps {
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
  onDelete?: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  filteredItems,
  kitchens,
  resolveTableName,
  onUpdateStatus,
  onDelete,
}) => {
  const itemsToUse = filteredItems || order.items;
  const hasPackaging = order.items.some(isPackagingOrderItem);
  const displayItems = itemsToUse.filter(requiresKitchenPreparation);

  const ticketSentAt = displayItems.find((i) => i.isSentToKitchen)?.sentAt || order.timestamp;
  const sentAtTimestampMs = ticketSentAt ? new Date(ticketSentAt).getTime() : undefined;
  const urgency = getTicketUrgency(ticketSentAt);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: `2px solid ${
          urgency.level === "critical"
            ? urgency.color
            : order.status === "ready"
            ? LOGIN_COLORS.primary
            : "transparent"
        }`,
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {order.invoiceNumber ? `#${order.invoiceNumber}` : "Orden en Curso"}
              </Typography>
              <Chip
                icon={<TimerIcon style={{ fontSize: "0.85rem", color: urgency.color }} />}
                label={urgency.label}
                size="small"
                sx={{
                  bgcolor: urgency.badgeBg,
                  color: urgency.color,
                  borderColor: urgency.badgeBorder,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            </Stack>

            <Typography variant="caption" color="text.secondary" display="block">
              Hora: {new Date(order.timestamp).toLocaleTimeString()}
            </Typography>

            {(order.customerName || order.tableId || hasPackaging) && (
              <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                {order.customerName && (
                  <Chip
                    label={order.customerName}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.65rem" }}
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
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.65rem" }}
                  />
                )}
                {hasPackaging && (
                  <Chip
                    label="Requiere Empaque"
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }}
                  />
                )}
              </Stack>
            )}
          </Box>
          {onDelete && (
            <IconButton
              size="small"
              color="error"
              aria-label="Anular orden"
              onClick={() => onDelete(order.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          {displayItems.map((item, idx) => {
            const kitchenName = kitchens.find((k) => k.id === item.kitchenId)?.name || "Sin área";
            const status = item.kitchenStatus || order.status;

            return (
              <Box
                key={idx}
                sx={{
                  p: 1,
                  bgcolor: item.note ? "rgba(255, 193, 7, 0.08)" : "transparent",
                  borderRadius: 1,
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {item.quantity}x {formatItemName(item.name, item.size)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kitchenName}
                    </Typography>
                  </Box>
                  <Box>
                    {status === "pending" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "preparing",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            item.kitchenId
                          )
                        }
                        sx={{
                          bgcolor: LOGIN_COLORS.primary,
                          "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                          minWidth: "80px",
                        }}
                      >
                        Preparar
                      </Button>
                    )}
                    {status === "preparing" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "ready",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            item.kitchenId
                          )
                        }
                        startIcon={<CheckCircleIcon sx={{ fontSize: "1rem" }} />}
                        sx={{ minWidth: "80px" }}
                      >
                        Listo
                      </Button>
                    )}
                    {status === "ready" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            "delivered",
                            undefined,
                            undefined,
                            sentAtTimestampMs,
                            item.kitchenId
                          )
                        }
                        sx={{ minWidth: "80px" }}
                      >
                        Entregar
                      </Button>
                    )}
                  </Box>
                </Box>
                {item.note && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{
                      mt: 0.5,
                      pl: 1,
                      fontStyle: "italic",
                      borderLeft: "2px solid",
                      borderColor: "#ffc107",
                    }}
                  >
                    Nota: {item.note}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
