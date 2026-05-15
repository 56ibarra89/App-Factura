import { Box, Typography, GlobalStyles } from "@mui/material";
import { CartItemType } from "../types/cart";
import { useEmpresaConfig } from "../hooks/useEmpresaConfig";
import { useGeneralConfigData } from "../hooks/useGeneralConfigData";
import { formatItemName } from "../utils/formatUtils";

interface TicketPrintProps {
  cart: CartItemType[];
  subTotal: number;
  taxAmount: number;
  total: number;
  customerName?: string;
  customerAddress?: string;
  orderType?: string;
  tableId?: string | null;
  invoiceNumber?: string;
}

const TicketPrint = ({
  cart,
  subTotal,
  taxAmount,
  total,
  customerName,
  customerAddress,
  orderType,
  tableId,
  invoiceNumber = "000001",
}: TicketPrintProps) => {
  const { config: empresa } = useEmpresaConfig();
  const { config: general } = useGeneralConfigData();

  const formatDate = () => {
    const d = new Date();
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            "body *": {
              visibility: "hidden",
            },
            ".print-ticket-container, .print-ticket-container *": {
              visibility: "visible",
            },
            ".print-ticket-container": {
              position: "absolute",
              left: 0,
              top: 0,
              width: "76mm",
              margin: 0,
              padding: "0 5mm",
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: "12px",
              lineHeight: "1.2",
              color: "#000",
            },
            "@page": {
              margin: 0,
            },
          },
        }}
      />

      <Box
        className="print-ticket-container"
        sx={{
          display: "none",
          "@media print": {
            display: "block",
          },
        }}
      >
        <Box textAlign="center" mb={2}>
          {empresa.logoUrl && (
            <Box mb={1} sx={{ display: "flex", justifyContent: "center" }}>
              <img
                src={empresa.logoUrl}
                alt="Logo Empresa"
                style={{
                  maxWidth: "30mm",
                  maxHeight: "30mm",
                  objectFit: "contain",
                  borderRadius: "50%",
                  filter: "grayscale(100%) contrast(1.2)",
                }}
              />
            </Box>
          )}
          <Typography variant="body1" fontWeight="bold" fontFamily="inherit">
            {empresa.businessName}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            {empresa.address}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            Tel: {empresa.phone}
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" fontFamily="inherit">
            Fecha: {formatDate()}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            Ticket #: {invoiceNumber}
          </Typography>
          {tableId && (
            <Typography variant="body2" fontFamily="inherit" fontWeight="bold">
              Mesa: {tableId}
            </Typography>
          )}
          {orderType && (
            <Typography variant="body2" fontFamily="inherit">
              Tipo: {orderType.toUpperCase()}
            </Typography>
          )}
          {customerName && (
            <Typography variant="body2" fontFamily="inherit">
              Cliente: {customerName}
            </Typography>
          )}
          {customerAddress && (
            <Typography variant="body2" fontFamily="inherit">
              Dirección: {customerAddress}
            </Typography>
          )}
        </Box>

        <Box
          mb={1}
          sx={{
            borderBottom: "1px dashed black",
            borderTop: "1px dashed black",
            py: 0.5,
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography
              variant="body2"
              fontFamily="inherit"
              sx={{ width: "15%" }}
            >
              CANT
            </Typography>
            <Typography
              variant="body2"
              fontFamily="inherit"
              sx={{ width: "55%" }}
            >
              DESCRIP
            </Typography>
            <Typography
              variant="body2"
              fontFamily="inherit"
              sx={{ width: "30%", textAlign: "right" }}
            >
              TOTAL
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          {cart.map((item, idx) => {
            const itemTotal =
              item.price *
              Math.max(0, item.quantity - (item.giftQuantity || 0));
            const nameFormatted = formatItemName(item.name, item.size);

            return (
              <Box key={idx} mb={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography
                    variant="body2"
                    fontFamily="inherit"
                    sx={{ width: "15%" }}
                  >
                    {item.quantity}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontFamily="inherit"
                    sx={{ width: "55%" }}
                  >
                    {nameFormatted}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontFamily="inherit"
                    sx={{ width: "30%", textAlign: "right" }}
                  >
                    {itemTotal.toFixed(2)}
                  </Typography>
                </Box>
                {item.extras?.map((extra, eIdx) => (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    key={`extra-${eIdx}`}
                    pl={2}
                  >
                    <Typography
                      variant="body2"
                      fontFamily="inherit"
                      sx={{ width: "15%" }}
                    ></Typography>
                    <Typography
                      variant="body2"
                      fontFamily="inherit"
                      sx={{ width: "55%" }}
                    >
                      + {extra.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="inherit"
                      sx={{ width: "30%", textAlign: "right" }}
                    >
                      {extra.price.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>

        <Box mb={2} sx={{ borderTop: "1px dashed black", pt: 1 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              Subtotal:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {subTotal.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              IVA:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {taxAmount.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              TOTAL:
            </Typography>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              {general.currencySymbol}
              {total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box textAlign="center" mt={3} mb={5}>
          <Typography variant="body2" fontFamily="inherit">
            {empresa.ticketFooter}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default TicketPrint;
