import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { LOGIN_COLORS } from "../../../shared/theme";

export interface InvoiceSummaryTotals {
  total: number;
  cash: number;
  card: number;
  app: number;
  count: number;
}

interface InvoiceSummaryCardsProps {
  summary: InvoiceSummaryTotals;
  currencySymbol?: string;
}

export default function InvoiceSummaryCards({
  summary,
  currencySymbol = "C$",
}: InvoiceSummaryCardsProps) {
  const cards = [
    {
      title: "Total Facturado",
      amount: summary.total,
      subtitle: `${summary.count} factura${summary.count === 1 ? "" : "s"} cobrada${summary.count === 1 ? "" : "s"}`,
      icon: <PointOfSaleIcon sx={{ fontSize: 28, color: LOGIN_COLORS.primary }} />,
      color: LOGIN_COLORS.primary,
      bgSubtle: LOGIN_COLORS.primarySubtle,
    },
    {
      title: "Total Efectivo",
      amount: summary.cash,
      subtitle: "Directo + porción mixto",
      icon: <AttachMoneyIcon sx={{ fontSize: 28, color: "success.main" }} />,
      color: "success.main",
      bgSubtle: "rgba(46, 125, 50, 0.06)",
    },
    {
      title: "Total Tarjeta / POS",
      amount: summary.card,
      subtitle: "Datáfono + porción mixto",
      icon: <CreditCardIcon sx={{ fontSize: 28, color: "info.main" }} />,
      color: "info.main",
      bgSubtle: "rgba(2, 136, 209, 0.06)",
    },
    {
      title: "Total App / Transf.",
      amount: summary.app,
      subtitle: "Banca en línea + porción mixto",
      icon: <PhoneAndroidIcon sx={{ fontSize: 28, color: "warning.main" }} />,
      color: "warning.main",
      bgSubtle: "rgba(237, 108, 2, 0.06)",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ my: 0.5, color: card.color }}
                  >
                    {currencySymbol}
                    {card.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    bgcolor: card.bgSubtle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
