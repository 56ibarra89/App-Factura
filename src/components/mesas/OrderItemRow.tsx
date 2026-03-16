import { Box, Grid, Typography } from "@mui/material";
import { OrderItem } from "../../types/order.types";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Props {
  item: OrderItem;
}

export default function OrderItemRow({ item }: Props) {
  return (
    <Box sx={{ 
      p: 1.5, 
      mb: 1, 
      borderRadius: 2, 
      transition: "all 0.2s",
      "&:hover": {
        bgcolor: "#f8f9fa"
      }
    }}>
      <Grid container alignItems="flex-start">
        <Grid size={2} textAlign="center">
          <Typography fontWeight="800" variant="body1" sx={{ 
            bgcolor: "rgba(0,0,0,0.05)", 
            display: "inline-block",
            width: 32,
            height: 32,
            lineHeight: "32px",
            borderRadius: "50%",
            color: "text.secondary"
          }}>
            {item.quantity}
          </Typography>
        </Grid>

        <Grid size={7} sx={{ pl: 1 }}>
          <Typography fontWeight="700" variant="body1" color="text.primary">
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {item.size}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled" fontWeight="500">
              {item.timestamp}
            </Typography>
          </Box>
        </Grid>

        <Grid size={3} textAlign="right">
          <Typography fontWeight="800" variant="body1" color="primary.main">
            ${(item.price * item.quantity).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
