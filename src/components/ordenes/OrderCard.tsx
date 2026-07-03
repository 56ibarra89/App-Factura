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
import { formatItemName, formatTableName } from "../../utils/formatUtils";
import { useMesasConfig } from "../../hooks/useMesasConfig";
import { useKitchens } from "../../hooks/useKitchens";

interface OrderCardProps {
  order: Order;
  filteredItems?: Order["items"];
  selectedKitchenId?: string;
  onUpdateStatus: (id: string, status: OrderStatus, cancelReason?: string, adminPin?: string, sentAt?: number, kitchenId?: string) => void;
  onDelete: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, filteredItems, selectedKitchenId, onUpdateStatus, onDelete }) => {
  const { floorsConfig } = useMesasConfig();
  const { kitchens } = useKitchens();
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.timestamp).getTime()) / 60000);

  const itemsToUse = filteredItems || order.items;
  // Obtener el sentAt del primer ítem que sí se manda a cocina (ignorar Delivery, etc)
  const ticketSentAt = itemsToUse.find(i => i.isSentToKitchen)?.sentAt;
  const ticketKitchenId = selectedKitchenId || itemsToUse.find(i => i.isSentToKitchen)?.kitchenId;

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
          <IconButton size="small" color="error" onClick={() => onDelete(order.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          {(filteredItems || order.items).map((item, idx) => {
            const kitchenName = kitchens.find(k => k.id === item.kitchenId)?.name || 'Sin área';
            const status = item.kitchenStatus || order.status;

            return (
              <Box key={idx} sx={{ p: 1, bgcolor: item.note ? 'rgba(255, 193, 7, 0.08)' : 'transparent', borderRadius: 1, border: '1px solid rgba(0,0,0,0.05)' }}>
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
                    {status === 'pending' && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={() => onUpdateStatus(order.id, 'preparing', undefined, undefined, ticketSentAt, item.kitchenId)}
                        sx={{ bgcolor: LOGIN_COLORS.primary, '&:hover': { bgcolor: LOGIN_COLORS.primaryDark }, minWidth: '80px' }}
                      >
                        Preparar
                      </Button>
                    )}
                    {status === 'preparing' && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={() => onUpdateStatus(order.id, 'ready', undefined, undefined, ticketSentAt, item.kitchenId)}
                        startIcon={<CheckCircleIcon sx={{ fontSize: '1rem' }}/>}
                        sx={{ minWidth: '80px' }}
                      >
                        Listo
                      </Button>
                    )}
                    {status === 'ready' && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => onUpdateStatus(order.id, 'delivered', undefined, undefined, ticketSentAt, item.kitchenId)}
                        sx={{ minWidth: '80px' }}
                      >
                        Entregar
                      </Button>
                    )}
                  </Box>
                </Box>
                {item.note && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, pl: 1, fontStyle: 'italic', borderLeft: '2px solid', borderColor: '#ffc107' }}>
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
