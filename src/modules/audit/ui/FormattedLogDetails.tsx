import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Collapse,
  Button,
  Stack,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CodeIcon from "@mui/icons-material/Code";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { parseLogDetails } from "../utils/logFormatter";
import { formatCurrency } from "../../../shared/format";

interface FormattedLogDetailsProps {
  details?: string;
  compact?: boolean;
}

export function FormattedLogDetails({ details, compact = false }: FormattedLogDetailsProps) {
  const [showRaw, setShowRaw] = useState(false);
  const parsed = parseLogDetails(details);

  if (!parsed.raw) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        Sin detalles adicionales.
      </Typography>
    );
  }

  // Si no es JSON, mostrar como texto plano estilizado
  if (!parsed.isJson) {
    return (
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          lineHeight: 1.5,
          fontWeight: 400,
        }}
      >
        {parsed.raw}
      </Typography>
    );
  }

  // Si es una orden finalizada / datos de factura
  if (parsed.orderInfo) {
    const { orderInfo } = parsed;

    if (compact) {
      return (
        <Typography variant="body2" color="text.primary">
          {parsed.summaryText}
          {orderInfo.finalTotal !== undefined && (
            <b> • Total: {formatCurrency(orderInfo.finalTotal)}</b>
          )}
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1} alignItems="center">
          {orderInfo.invoiceNumber && (
            <Chip
              icon={<ReceiptIcon sx={{ fontSize: 16 }} />}
              label={`Factura: ${orderInfo.invoiceNumber}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}

          {orderInfo.orderId && (
            <Chip
              icon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
              label={`Orden: ${orderInfo.orderId}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}

          {orderInfo.finalTotal !== undefined && (
            <Chip
              icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
              label={`Total: ${formatCurrency(orderInfo.finalTotal)}`}
              size="small"
              color="success"
              sx={{ fontWeight: 700, color: "#fff" }}
            />
          )}

          {orderInfo.payments && orderInfo.payments.length > 0 && (
            orderInfo.payments.map((p, idx) => (
              <Chip
                key={idx}
                icon={<PaymentIcon sx={{ fontSize: 16 }} />}
                label={`${p.method}: ${formatCurrency(p.amount)}`}
                size="small"
                variant="filled"
                sx={{ bgcolor: "action.selected", fontWeight: 600 }}
              />
            ))
          )}

          {orderInfo.promotionCode && (
            <Chip
              icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
              label={`Cupón: ${orderInfo.promotionCode}`}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            startIcon={<CodeIcon sx={{ fontSize: 14 }} />}
            endIcon={showRaw ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
            onClick={() => setShowRaw(!showRaw)}
            sx={{
              fontSize: "0.72rem",
              textTransform: "none",
              color: "text.secondary",
              p: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            {showRaw ? "Ocultar JSON técnico" : "Ver datos técnicos"}
          </Button>

          <Collapse in={showRaw}>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                mt: 1,
                borderRadius: 1,
                bgcolor: "grey.900",
                color: "grey.100",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                overflowX: "auto",
                maxHeight: "150px",
              }}
            >
              {JSON.stringify(JSON.parse(parsed.raw), null, 2)}
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  }

  // Para otros objetos JSON genéricos
  return (
    <Box sx={{ mt: 0.5 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={0.8}>
        {parsed.keyValuePairs?.map((item) => (
          <Chip
            key={item.key}
            label={`${item.label}: ${item.value}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.75rem", bgcolor: "background.paper" }}
          />
        ))}
      </Stack>
    </Box>
  );
}
