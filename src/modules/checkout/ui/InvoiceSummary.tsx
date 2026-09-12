import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { OrderItem } from "../../orders";
import type { GeneralConfigState } from "../../settings";
import { formatItemName } from "../../../shared/format";

interface InvoiceSummaryProps {
  cart: OrderItem[];
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  extraCostsTax: number;
  totalPackagingCost: number;
  deliveryCost: number;
  showDeliveryCost: boolean;
  finalTotal: number;
  finalTotalSecondary: number;
  exchangeRate: number;
  config: GeneralConfigState;
}

export default function InvoiceSummary({
  cart,
  subTotal,
  discountAmount,
  taxAmount,
  extraCostsTax,
  totalPackagingCost,
  deliveryCost,
  showDeliveryCost,
  finalTotal,
  finalTotalSecondary,
  exchangeRate,
  config,
}: InvoiceSummaryProps) {
  return (
    <>
      <List>
        {cart.map((item, index) => (
          <ListItem
            key={`${item.productId ?? item.name}-${item.size}-${index}`}
            disableGutters
          >
            <ListItemText
              primary={`${formatItemName(item.name, item.size)} x${item.quantity}`}
              secondary={
                <Box component="span" display="flex" flexDirection="column">
                  {item.comboSelections && item.comboSelections.length > 0 && (
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        my: 0.5,
                        pl: 1,
                        borderLeft: "2px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      {item.comboSelections.map((s, sIdx) => {
                        const sizeText =
                          s.size && s.size !== "único" ? ` (${s.size})` : "";
                        const extraText =
                          s.extraPrice && s.extraPrice > 0
                            ? ` (+C$${s.extraPrice.toFixed(2)})`
                            : "";
                        return (
                          <Typography
                            key={sIdx}
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", fontSize: "0.75rem" }}
                          >
                            • {s.quantity}x {s.productName}{sizeText}{extraText}
                          </Typography>
                        );
                      })}
                    </Box>
                  )}
                  {item.extras?.length > 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="primary"
                    >
                      Extras:{" "}
                      {item.extras
                        .map(
                          (extra) =>
                            `${extra.name} (+C$${extra.price.toFixed(2)})`,
                        )
                        .join(", ")}
                    </Typography>
                  )}
                  {item.note && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="error.main"
                      sx={{ fontStyle: "italic" }}
                    >
                      Nota: {item.note}
                    </Typography>
                  )}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {`C$${item.price.toFixed(2)} c/u — Subtotal: C$${(
                      item.price *
                      Math.max(
                        0,
                        item.quantity - (item.giftQuantity ?? 0),
                      )
                    ).toFixed(2)}`}
                  </Typography>
                  {(item.giftQuantity ?? 0) > 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="success.main"
                    >
                      Regalo: {item.giftQuantity} item(s) (-C$
                      {(item.price * (item.giftQuantity ?? 0)).toFixed(2)})
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography>Subtotal:</Typography>
        <Typography>C${subTotal.toFixed(2)}</Typography>
      </Box>
      {discountAmount > 0 && (
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography color="success.main">Descuento:</Typography>
          <Typography color="success.main">
            -C${discountAmount.toFixed(2)}
          </Typography>
        </Box>
      )}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography>Impuestos:</Typography>
        <Typography>C${(taxAmount + extraCostsTax).toFixed(2)}</Typography>
      </Box>
      {totalPackagingCost > 0 && (
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Empaques:</Typography>
          <Typography>C${totalPackagingCost.toFixed(2)}</Typography>
        </Box>
      )}
      {showDeliveryCost && (
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Transporte:</Typography>
          {deliveryCost > 0 ? (
            <Typography>C${deliveryCost.toFixed(2)}</Typography>
          ) : (
            <Typography color="success.main" fontWeight="bold">
              GRATIS
            </Typography>
          )}
        </Box>
      )}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography fontWeight="bold">Total:</Typography>
        <Box textAlign="right">
          <Typography fontWeight="bold" color="error.main">
            {config.currencySymbol}
            {finalTotal.toFixed(2)}
          </Typography>
          {config.enableSecondaryCurrency && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Equivalente: {config.secondaryCurrencySymbol}
              {finalTotalSecondary.toFixed(2)} (Tasa: {config.currencySymbol}
              {exchangeRate})
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
}
