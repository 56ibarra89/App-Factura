import { Box, Grid, Typography, alpha, Divider } from "@mui/material";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function OrderHeader() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Title Area */}
      <Box sx={{ 
        p: 2.5, 
        display: "flex", 
        alignItems: "center", 
        gap: 1.5,
        bgcolor: "white" 
      }}>
        <Box sx={{ 
          bgcolor: alpha("#ff9800", 0.1), 
          color: "#ff9800", 
          p: 1, 
          borderRadius: 2,
          display: "flex"
        }}>
          <ReceiptLongIcon />
        </Box>
        <Typography variant="h6" fontWeight="700" color="text.primary">
          Pedido Actual
        </Typography>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      {/* Column Headers */}
      <Box sx={{ 
        bgcolor: "#f8f9fa", 
        color: "text.secondary", 
        py: 1.2, 
        px: 2,
        borderBottom: "1px solid rgba(0,0,0,0.06)"
      }}>
        <Grid container alignItems="center">
          <Grid size={2} textAlign="center">
            <Typography variant="overline" fontWeight="700" sx={{ letterSpacing: 1 }}>
              CANT
            </Typography>
          </Grid>
          <Grid size={7} sx={{ pl: 1 }}>
            <Typography variant="overline" fontWeight="700" sx={{ letterSpacing: 1 }}>
              DESCRIPCIÓN
            </Typography>
          </Grid>
          <Grid size={3} textAlign="right">
            <Typography variant="overline" fontWeight="700" sx={{ letterSpacing: 1 }}>
              TOTAL
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
