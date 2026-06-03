import { Box, Grid, Typography, Divider } from "@mui/material";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { LOGIN_GRADIENTS } from "../../theme/loginTheme";

export default function OrderHeader() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Title Area */}
      <Box sx={{ 
        p: 2.5, 
        display: "flex", 
        alignItems: "center", 
        gap: 1.5,
        background: LOGIN_GRADIENTS.brandingPanel,
        color: "white" 
      }}>
        <Box sx={{ 
          bgcolor: "rgba(255,255,255,0.1)", 
          color: "white", 
          p: 1, 
          borderRadius: 2,
          display: "flex"
        }}>
          <ReceiptLongIcon />
        </Box>
        <Typography variant="h6" fontWeight="800" color="inherit" sx={{ letterSpacing: 0.5 }}>
          PEDIDO ACTUAL
        </Typography>
      </Box>

      <Divider sx={{ opacity: 0.1, bgcolor: "white" }} />

      {/* Column Headers */}
      <Box sx={{ 
        bgcolor: "action.hover", 
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
