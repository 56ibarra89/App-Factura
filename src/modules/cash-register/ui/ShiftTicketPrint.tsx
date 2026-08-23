import { Box, Typography, GlobalStyles } from "@mui/material";
import type { Shift } from "../model/cash-register.types";
import { useCompanySettings, useGeneralSettings } from "../../settings";

interface ShiftTicketPrintProps {
  shift: Shift;
}

const ShiftTicketPrint = ({ shift }: ShiftTicketPrintProps) => {
  const { config: empresa } = useCompanySettings();
  const { config: general } = useGeneralSettings();

  const formatDate = (dateValue: Date | string | number | undefined | null) => {
    if (!dateValue) return "N/A";
    const d = new Date(dateValue);
    return (
      d.toLocaleDateString("es-ES") +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const totalExpenses =
    shift.totalExpenses !== undefined
      ? shift.totalExpenses
      : (shift.expenses || []).reduce((acc, e) => acc + Number(e.amount), 0);

  const expectedCash =
    shift.expectedCash ??
    shift.openingAmount + shift.totalSales.cash - totalExpenses;

  const difference =
    shift.cashDifference ?? (shift.closingAmount ?? 0) - expectedCash;

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
            {empresa.businessName || "PIZZA TO GO"}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            ARQUEO DE CAJA
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" fontFamily="inherit">
            Cajero: {shift.cashierName}
          </Typography>
          {shift.cashRegisterName && (
            <Typography variant="body2" fontFamily="inherit">
              Caja: {shift.cashRegisterName}
            </Typography>
          )}
          <Typography variant="body2" fontFamily="inherit">
            Inicio: {formatDate(shift.startTime)}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            Cierre: {formatDate(shift.endTime)}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            Turno #: {shift.id.split("-")[1] || shift.id}
          </Typography>
        </Box>

        <Box
          mb={1}
          sx={{
            borderBottom: "1px dashed black",
            borderTop: "1px dashed black",
            py: 0.5,
          }}
        >
          <Typography
            variant="body2"
            fontFamily="inherit"
            fontWeight="bold"
            textAlign="center"
          >
            RESUMEN GENERAL DE VENTAS
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              Efectivo:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {shift.totalSales.cash.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              Tarjeta (Datáfono/POS):
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {shift.totalSales.card.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              App / Delivery:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {shift.totalSales.app.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              TOTAL FACTURADO:
            </Typography>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              {general.currencySymbol}
              {shift.totalSales.total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {shift.expenses && shift.expenses.length > 0 && (
          <>
            <Box
              mb={1}
              sx={{
                borderBottom: "1px dashed black",
                borderTop: "1px dashed black",
                py: 0.5,
              }}
            >
              <Typography
                variant="body2"
                fontFamily="inherit"
                fontWeight="bold"
                textAlign="center"
              >
                GASTOS / EGRESOS ({shift.expenses.length})
              </Typography>
            </Box>

            <Box mb={2}>
              {shift.expenses.map((e, idx) => (
                <Box
                  key={e.id || idx}
                  display="flex"
                  justifyContent="space-between"
                  mb={0.5}
                >
                  <Typography
                    variant="caption"
                    fontFamily="inherit"
                    sx={{ maxWidth: "60%" }}
                  >
                    • {e.reason}
                  </Typography>
                  <Typography variant="caption" fontFamily="inherit">
                    - {general.currencySymbol}
                    {Number(e.amount).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography
                  variant="body2"
                  fontFamily="inherit"
                  fontWeight="bold"
                >
                  TOTAL GASTOS:
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="inherit"
                  fontWeight="bold"
                >
                  - {general.currencySymbol}
                  {totalExpenses.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        <Box
          mb={1}
          sx={{
            borderBottom: "1px dashed black",
            borderTop: "1px dashed black",
            py: 0.5,
          }}
        >
          <Typography
            variant="body2"
            fontFamily="inherit"
            fontWeight="bold"
            textAlign="center"
          >
            ARQUEO DE EFECTIVO (CAJÓN FÍSICO)
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              (+) Monto de Apertura:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {shift.openingAmount.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontFamily="inherit">
              (+) Ventas en Efectivo:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {general.currencySymbol}
              {shift.totalSales.cash.toFixed(2)}
            </Typography>
          </Box>
          {totalExpenses > 0 && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" fontFamily="inherit">
                (-) Gastos de Caja Chica:
              </Typography>
              <Typography variant="body2" fontFamily="inherit">
                - {general.currencySymbol}
                {totalExpenses.toFixed(2)}
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              EFECTIVO ESPERADO:
            </Typography>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              {general.currencySymbol}
              {expectedCash.toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              EFECTIVO REAL CONTADO:
            </Typography>
            <Typography variant="body1" fontFamily="inherit" fontWeight="bold">
              {general.currencySymbol}
              {(shift.closingAmount ?? 0).toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" fontFamily="inherit">
              Diferencia:
            </Typography>
            <Typography
              variant="body2"
              fontFamily="inherit"
              fontWeight="bold"
            >
              {difference >= 0 ? "+" : ""}
              {general.currencySymbol}
              {difference.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {shift.denominationBreakdown && shift.denominationBreakdown.length > 0 && (
          <Box mb={2}>
            <Typography variant="body2" fontFamily="inherit" fontWeight="bold">
              DESGLOSE DEL CONTEO:
            </Typography>
            {shift.denominationBreakdown
              .filter((entry) => entry.quantity > 0)
              .map((entry) => (
                <Box key={entry.denomination} display="flex" justifyContent="space-between">
                  <Typography variant="caption" fontFamily="inherit">
                    {entry.quantity} x {general.currencySymbol}{entry.denomination.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" fontFamily="inherit">
                    {general.currencySymbol}{(entry.quantity * entry.denomination).toFixed(2)}
                  </Typography>
                </Box>
              ))}
          </Box>
        )}

        {shift.discrepancyReason && (
          <Box mt={2}>
            <Typography variant="body2" fontFamily="inherit" fontWeight="bold">
              Justificación del descuadre:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {shift.discrepancyReason}
            </Typography>
            {shift.authorizedByName && (
              <Typography variant="caption" fontFamily="inherit">
                Autorizado por: {shift.authorizedByName} ({shift.authorizedByRole})
              </Typography>
            )}
          </Box>
        )}

        {shift.notes && (
          <Box mt={2}>
            <Typography variant="body2" fontFamily="inherit" fontWeight="bold">
              Notas:
            </Typography>
            <Typography variant="body2" fontFamily="inherit">
              {shift.notes}
            </Typography>
          </Box>
        )}

        <Box textAlign="center" mt={3} mb={5}>
          <Typography variant="body2" fontFamily="inherit">
            -- Fin del Arqueo --
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default ShiftTicketPrint;
