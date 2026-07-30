import { Box, Typography, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../auth";
import type { OrderItem } from "../../orders";
import { useTaxConfig } from "../../settings";

interface Props {
  order: OrderItem[];
  cashierName?: string;
}

export default function OrderSummary({ order, cashierName }: Props) {
  const { username } = useAuth();
  const displayUsername = cashierName || username;
  const { taxes, isExonerated } = useTaxConfig();

  const subTotal = order.reduce(
    (acc, item) => {
      const giftQty = item.giftQuantity || 0;
      const paidQty = Math.max(0, item.quantity - giftQty);
      return acc + item.price * paidQty;
    },
    0,
  );

  const activeTax = taxes[0]?.percentage || 0;
  const taxAmount = isExonerated ? 0 : subTotal * (activeTax / 100);
  const total = subTotal + taxAmount;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 0.5,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2" fontWeight="500">
          Subtotal
        </Typography>
        <Typography variant="body2" fontWeight="700">
          C${subTotal.toFixed(2)}
        </Typography>
      </Box>

      {!isExonerated && activeTax > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0.5,
            color: "text.secondary",
          }}
        >
          <Typography variant="body2" fontWeight="500">
            {taxes[0]?.name || "IVA"} {activeTax}%
          </Typography>
          <Typography variant="body2" fontWeight="700">
            C${taxAmount.toFixed(2)}
          </Typography>
        </Box>
      )}

      {isExonerated && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0.5,
            color: "success.main",
          }}
        >
          <Typography variant="body2" fontWeight="500">
            Exoneración de Impuestos
          </Typography>
          <Typography variant="body2" fontWeight="700">
            -C$0.00
          </Typography>
        </Box>
      )}

      <Divider sx={{ borderStyle: "dashed", opacity: 0.6, my: 1 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Total
        </Typography>
        <Typography variant="h5" fontWeight="900" color="text.primary">
          C${total.toFixed(2)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "action.hover",
          p: 1,
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
            {displayUsername}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}
