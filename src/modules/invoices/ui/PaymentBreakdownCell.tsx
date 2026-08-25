import { Box, Stack, Typography } from "@mui/material";
import type { Invoice } from "../model/invoice.types";

interface Props {
  invoice: Invoice;
}

export default function PaymentBreakdownCell({ invoice }: Props) {
  const method = (invoice.paymentMethod || "EFECTIVO").toUpperCase();

  if (method === "MIXTO" && invoice.splitAmounts) {
    const cash = invoice.splitAmounts.efectivo ?? 0;
    const card = invoice.splitAmounts.tarjeta ?? 0;
    const app = invoice.splitAmounts.app ?? 0;

    return (
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ rowGap: 0.5 }}
      >
        {cash > 0 && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.3,
              bgcolor: "success.main",
              color: "#fff",
              px: 0.85,
              py: 0.3,
              borderRadius: 1.5,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            <span>💵 Efec:</span>
            <span>C${cash.toFixed(2)}</span>
          </Box>
        )}
        {card > 0 && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.3,
              bgcolor: "info.main",
              color: "#fff",
              px: 0.85,
              py: 0.3,
              borderRadius: 1.5,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            <span>💳 Tarj:</span>
            <span>C${card.toFixed(2)}</span>
          </Box>
        )}
        {app > 0 && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.3,
              bgcolor: "warning.main",
              color: "#fff",
              px: 0.85,
              py: 0.3,
              borderRadius: 1.5,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            <span>📱 App:</span>
            <span>C${app.toFixed(2)}</span>
          </Box>
        )}
      </Stack>
    );
  }

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: "0.82rem" }}
    >
      Total {method.toLowerCase()}
    </Typography>
  );
}
