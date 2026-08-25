import { Chip } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import type { PaymentMethod } from "../model/invoice.types";

interface PaymentMethodBadgeProps {
  paymentMethod?: PaymentMethod | string;
}

export default function PaymentMethodBadge({
  paymentMethod,
}: PaymentMethodBadgeProps) {
  const method = (paymentMethod || "").toUpperCase();

  if (method === "EFECTIVO") {
    return (
      <Chip
        icon={<AttachMoneyIcon sx={{ fontSize: "1rem !important" }} />}
        label="Efectivo"
        color="success"
        size="small"
        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
      />
    );
  }

  if (method === "TARJETA") {
    return (
      <Chip
        icon={<CreditCardIcon sx={{ fontSize: "1rem !important" }} />}
        label="Tarjeta"
        color="info"
        size="small"
        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
      />
    );
  }

  if (method === "APP") {
    return (
      <Chip
        icon={<PhoneAndroidIcon sx={{ fontSize: "1rem !important" }} />}
        label="App / Transf."
        color="warning"
        size="small"
        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
      />
    );
  }

  if (method === "MIXTO") {
    return (
      <Chip
        icon={<CallSplitIcon sx={{ fontSize: "1rem !important" }} />}
        label="Mixto"
        color="secondary"
        size="small"
        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
      />
    );
  }

  return (
    <Chip
      label={paymentMethod || "---"}
      size="small"
      variant="outlined"
      sx={{ color: "text.secondary" }}
    />
  );
}
