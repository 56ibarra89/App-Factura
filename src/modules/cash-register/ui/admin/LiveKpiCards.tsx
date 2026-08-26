import { Box, Card, CardContent, Grid, Stack, Typography, Skeleton } from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TableBarIcon from "@mui/icons-material/TableBar";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { LOGIN_COLORS } from "../../../../shared/theme";
import type { LiveKpis } from "../../api/adminDashboardGateway";

interface LiveKpiCardsProps {
  kpis: LiveKpis;
  loading?: boolean;
}

export const LiveKpiCards = ({ kpis, loading = false }: LiveKpiCardsProps) => {
  const cards = [
    {
      title: "Ventas Totales Hoy",
      value: `C$${kpis.totalSalesToday.toFixed(2)}`,
      subtitle: "Ingresos recaudados del día",
      icon: <PointOfSaleIcon sx={{ fontSize: 28, color: LOGIN_COLORS.primary }} />,
      color: LOGIN_COLORS.primary,
      bgSubtle: LOGIN_COLORS.primarySubtle,
    },
    {
      title: "Mesas Ocupadas",
      value: `${kpis.activeOccupiedTables}`,
      subtitle: "Comensales activos en sala",
      icon: <TableBarIcon sx={{ fontSize: 28, color: "info.main" }} />,
      color: "info.main",
      bgSubtle: "rgba(25, 118, 210, 0.08)",
    },
    {
      title: "En Cocina",
      value: `${kpis.pendingKitchenOrders}`,
      subtitle: "Comandas en preparación",
      icon: <SoupKitchenIcon sx={{ fontSize: 28, color: "warning.main" }} />,
      color: "warning.main",
      bgSubtle: "rgba(237, 108, 2, 0.08)",
    },
    {
      title: "Delivery en Ruta",
      value: `${kpis.activeDeliveryOrders}`,
      subtitle: "Envíos y despachos activos",
      icon: <TwoWheelerIcon sx={{ fontSize: 28, color: "success.main" }} />,
      color: "success.main",
      bgSubtle: "rgba(46, 125, 50, 0.08)",
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {cards.map((card) => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    textTransform="uppercase"
                    letterSpacing={0.5}
                  >
                    {card.title}
                  </Typography>

                  {loading ? (
                    <Skeleton variant="text" width={100} height={36} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      sx={{ my: 0.5, color: card.color }}
                    >
                      {card.value}
                    </Typography>
                  )}

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
};
