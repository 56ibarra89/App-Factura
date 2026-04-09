import { Box, Typography, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../context/AuthContext";
import { CartItemType } from "../../types/cart";

interface Props {
  order: CartItemType[];
}

export default function OrderSummary({ order }: Props) {
  const { username } = useAuth();
  const subTotal = order.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2" fontWeight="500">
          Subtotal
        </Typography>
        <Typography variant="body2" fontWeight="700">
          ${subTotal.toFixed(2)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2" fontWeight="500">
          IVA 15%
        </Typography>
        <Typography variant="body2" fontWeight="700">
          $0.00
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: "dashed", opacity: 0.6, my: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="800" color="text.primary">
          Total
        </Typography>
        <Typography variant="h4" fontWeight="900" color="text.primary">
          ${subTotal.toFixed(2)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "rgba(0,0,0,0.03)",
          p: 1.5,
          borderRadius: 2,
        }}
      >
        <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          Mesero:{" "}
          <Box
            component="span"
            sx={{ color: "text.primary", fontWeight: "700" }}
          >
            {username}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
