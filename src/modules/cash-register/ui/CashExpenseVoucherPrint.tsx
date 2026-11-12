import { Box, Typography, GlobalStyles } from "@mui/material";
import type { CashExpense } from "../model/cash-expense.types";
import { CASH_EXPENSE_CATEGORY_LABELS } from "../model/cash-expense.types";
import { useCompanySettings } from "../../settings";

interface CashExpenseVoucherPrintProps {
  expense: CashExpense;
}

export default function CashExpenseVoucherPrint({
  expense,
}: CashExpenseVoucherPrintProps) {
  const { config: empresa } = useCompanySettings();

  const formatDate = (dateValue: Date | string | undefined | null) => {
    if (!dateValue) return "N/A";
    const d = new Date(dateValue);
    return (
      d.toLocaleDateString("es-ES") +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const categoryInfo =
    CASH_EXPENSE_CATEGORY_LABELS[expense.category] || {
      label: expense.category,
    };

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            "body *": {
              visibility: "hidden",
            },
            ".print-expense-container, .print-expense-container *": {
              visibility: "visible",
            },
            ".print-expense-container": {
              position: "absolute",
              left: 0,
              top: 0,
              width: "76mm",
              margin: 0,
              padding: "0 5mm",
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: "12px",
              lineHeight: "1.3",
              color: "#000",
            },
            "@page": {
              margin: 0,
            },
          },
        }}
      />

      <Box
        className="print-expense-container"
        sx={{
          display: "none",
          "@media print": {
            display: "block",
          },
        }}
      >
        <Box textAlign="center" mb={1.5}>
          {empresa.logoUrl && (
            <Box mb={1} sx={{ display: "flex", justifyContent: "center" }}>
              <img
                src={empresa.logoUrl}
                alt="Logo Empresa"
                style={{
                  maxWidth: "28mm",
                  maxHeight: "28mm",
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
          <Typography
            variant="body2"
            fontWeight="bold"
            fontFamily="inherit"
            sx={{ textDecoration: "underline", my: 0.5 }}
          >
            VALE DE EGRESO DE CAJA
          </Typography>
          <Typography variant="caption" fontFamily="inherit" color="text.secondary">
            ID: #{expense.id.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>

        <Box mb={1} sx={{ borderTop: "1px dashed #000", pt: 1 }}>
          <Typography variant="body2" fontFamily="inherit">
            <strong>Fecha:</strong> {formatDate(expense.createdAt)}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            <strong>Cajero:</strong> {expense.cashierSnapshotName}
          </Typography>
          <Typography variant="body2" fontFamily="inherit">
            <strong>Categoría:</strong> {categoryInfo.label}
          </Typography>
          {expense.voucherNumber && (
            <Typography variant="body2" fontFamily="inherit">
              <strong>N° Fact/Recibo:</strong> {expense.voucherNumber}
            </Typography>
          )}
        </Box>

        <Box
          mb={1.5}
          sx={{
            borderTop: "1px dashed #000",
            borderBottom: "1px dashed #000",
            py: 1,
          }}
        >
          <Typography variant="body2" fontFamily="inherit">
            <strong>Concepto / Motivo:</strong>
          </Typography>
          <Typography
            variant="body2"
            fontFamily="inherit"
            sx={{ pl: 1, mt: 0.5, fontStyle: "italic" }}
          >
            "{expense.reason}"
          </Typography>
          {expense.notes && (
            <Typography
              variant="caption"
              fontFamily="inherit"
              display="block"
              sx={{ pl: 1, mt: 0.5 }}
            >
              Nota: {expense.notes}
            </Typography>
          )}
        </Box>

        <Box
          textAlign="center"
          my={2}
          sx={{
            border: "1px solid #000",
            p: 1,
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" fontFamily="inherit" display="block">
            MONTO RETIRADO
          </Typography>
          <Typography variant="h6" fontWeight="bold" fontFamily="inherit">
            C${expense.amount.toFixed(2)}
          </Typography>
        </Box>

        <Box mt={3} pt={2} textAlign="center">
          <Box sx={{ borderTop: "1px solid #000", width: "80%", mx: "auto", mb: 0.5 }} />
          <Typography variant="caption" fontFamily="inherit" display="block">
            Firma Cajero / Autoriza
          </Typography>

          <Box sx={{ borderTop: "1px solid #000", width: "80%", mx: "auto", mt: 3, mb: 0.5 }} />
          <Typography variant="caption" fontFamily="inherit" display="block">
            Firma Quien Recibe Efectivo
          </Typography>
        </Box>

        <Box textAlign="center" mt={3} mb={1}>
          <Typography variant="caption" fontFamily="inherit" color="text.secondary">
            *** Conserve este comprobante en caja ***
          </Typography>
        </Box>
      </Box>
    </>
  );
}
