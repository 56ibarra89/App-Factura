import { Chip, Stack, Typography } from "@mui/material";
import type { Invoice } from "../model/invoice.types";
import {
  getOrderPaymentDetails,
  getPaymentDisplayName,
} from "../../orders";

interface Props {
  invoice: Invoice;
}

export default function PaymentBreakdownCell({ invoice }: Props) {
  const payments = getOrderPaymentDetails(invoice);

  return (
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      sx={{ rowGap: 0.5 }}
    >
      {payments.map((payment, index) => {
        const original =
          payment.currency === "USD" && payment.originalAmount !== undefined
            ? ` (US$${payment.originalAmount.toFixed(2)})`
            : "";
        return (
          <Chip
            key={`${payment.methodConfigId || payment.method}-${index}`}
            size="small"
            variant={payments.length > 1 ? "filled" : "outlined"}
            color={payment.methodType === "CASH" ? "success" : "default"}
            label={`${getPaymentDisplayName(payment)}: C$${payment.amount.toFixed(2)}${original}`}
            sx={{ fontWeight: 700, fontSize: "0.72rem" }}
          />
        );
      })}
      {payments.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Sin detalle
        </Typography>
      )}
    </Stack>
  );
}
