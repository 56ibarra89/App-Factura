import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { LOGIN_SHADOWS } from "../../../shared/theme";
import type { ChannelSalesSummary } from "../model/salesReport.types";

interface SalesChannelsCardProps {
  channels: ChannelSalesSummary[];
  masked?: boolean;
}

const getChannelVisual = (type: ChannelSalesSummary["type"]) => {
  if (type === "delivery") {
    return {
      icon: <DeliveryDiningIcon />,
      color: "warning.main",
    };
  }
  if (type === "llevar") {
    return {
      icon: <ShoppingBagIcon />,
      color: "primary.main",
    };
  }
  return {
    icon: <TableRestaurantIcon />,
    color: "success.main",
  };
};

export function SalesChannelsCard({
  channels,
  masked = false,
}: SalesChannelsCardProps) {
  const hasSales = channels.some(
    (channel) => channel.ordersCount > 0 || channel.sales > 0,
  );

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: LOGIN_SHADOWS.card,
        bgcolor: "background.default",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Canales de Venta
        </Typography>

        {!hasSales ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 4 }}
          >
            No hay ventas registradas en este período.
          </Typography>
        ) : (
          <Stack spacing={2.5}>
            {channels.map((channel) => {
              const visual = getChannelVisual(channel.type);
              const percentage = Math.min(
                100,
                Math.max(0, channel.percentage),
              );

              return (
                <Box key={channel.type}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          color: visual.color,
                          bgcolor: "action.hover",
                          borderRadius: 2,
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {visual.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {channel.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {channel.ordersCount} pedido
                          {channel.ordersCount === 1 ? "" : "s"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700}>
                        {masked ? "********" : `C$${channel.sales.toFixed(2)}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {channel.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: visual.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
