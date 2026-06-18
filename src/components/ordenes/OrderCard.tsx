import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Order, OrderStatus } from "../../types/order.types";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { statusColors, statusLabels } from "../../config/orderStatusConfig";
import { formatItemName, formatTableName } from "../../utils/formatUtils";
import { useMesasConfig } from "../../hooks/useMesasConfig";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, status: OrderStatus, cancelReason?: string, adminPin?: string, sentAt?: number) => void;
  onDelete: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onDelete }) => {
  const { floorsConfig } = useMesasConfig();
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.timestamp).getTime()) / 60000);

  // Obtener el sentAt del primer ítem que sí se manda a cocina (ignorar Delivery, etc)
  const ticketSentAt = order.items.find(i => i.isSentToKitchen)?.sentAt;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: `1px solid ${order.status === 'ready' ? LOGIN_COLORS.primary : 'transparent'}`,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {order.invoiceNumber ? `#${order.invoiceNumber}` : "Orden en Curso"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {new Date(order.timestamp).toLocaleTimeString()} ({timeElapsed} min)
            </Typography>
            {(order.customerName || order.tableId) && (
              <Stack direction="row" spacing={1} mt={0.5}>
                {order.customerName && (
                  <Chip 
                    label={order.customerName} 
                    size="small" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: '0.65rem' }} 
                  />
                )}
                {order.tableId && (
                  <Chip 
                    label={formatTableName(order.tableId, floorsConfig)} 
                    size="small" 
                    color="secondary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }} 
                  />
                )}
              </Stack>
            )}
          </Box>
          <Chip 
            label={statusLabels[order.status]} 
            color={statusColors[order.status]} 
            size="small" 
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          {order.items.map((item, idx) => (
            <Box key={idx} sx={{ p: 0.5, bgcolor: item.note ? 'rgba(255, 193, 7, 0.08)' : 'transparent', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {item.quantity}x {formatItemName(item.name, item.size)}
              </Typography>
              {item.note && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, pl: 1, fontStyle: 'italic', borderLeft: '2px solid', borderColor: '#ffc107' }}>
                  Nota: {item.note}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box>
          {order.status === 'pending' && (
            <Button 
              size="small" 
              variant="contained" 
              onClick={() => onUpdateStatus(order.id, 'preparing', undefined, undefined, ticketSentAt)}
              sx={{ bgcolor: LOGIN_COLORS.primary, '&:hover': { bgcolor: LOGIN_COLORS.primaryDark } }}
            >
              Preparar
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button 
              size="small" 
              variant="contained" 
              color="success"
              onClick={() => onUpdateStatus(order.id, 'ready', undefined, undefined, ticketSentAt)}
              startIcon={<CheckCircleIcon />}
            >
              Listo
            </Button>
          )}
          {order.status === 'ready' && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => onUpdateStatus(order.id, 'delivered', undefined, undefined, ticketSentAt)}
            >
              Entregar
            </Button>
          )}
        </Box>
        <IconButton size="small" color="error" onClick={() => onDelete(order.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default OrderCard;
