import { Grid, Button, alpha } from "@mui/material";
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LogoutIcon from '@mui/icons-material/Logout';

export default function OrderActions() {
  const primaryColor = "#4482ff";
  const successColor = "#2ecc71";

  return (
    <Grid container spacing={1.5}>
      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PrintIcon />}
          sx={{
            py: 1.5,
            bgcolor: primaryColor,
            color: "white",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
            "&:hover": { bgcolor: "#2962ff", boxShadow: `0 6px 16px ${alpha(primaryColor, 0.4)}` }
          }}
        >
          Imprimir
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditIcon />}
          sx={{ 
            py: 1.5,
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            borderWidth: 2,
            "&:hover": { borderWidth: 2 }
          }}
        >
          Editar
        </Button>
      </Grid>

      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<MergeTypeIcon />}
          sx={{
            py: 1.5,
            bgcolor: alpha(primaryColor, 0.1),
            color: primaryColor,
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: "none",
            "&:hover": { 
              bgcolor: alpha(primaryColor, 0.2), 
              boxShadow: "none" 
            }
          }}
        >
          Unir Mesa o Mover Pedido
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<EventSeatIcon />}
          sx={{ 
            py: 1.5,
            bgcolor: successColor, 
            color: "white",
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
            boxShadow: `0 4px 12px ${alpha(successColor, 0.3)}`,
            "&:hover": { bgcolor: "#27ae60", boxShadow: `0 6px 16px ${alpha(successColor, 0.4)}` }
          }}
        >
          Reservar
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="text"
          startIcon={<LogoutIcon />}
          color="error"
          sx={{ 
            py: 1.5,
            textTransform: "none",
            fontWeight: "700",
            borderRadius: 2.5,
          }}
        >
          Salir
        </Button>
      </Grid>
    </Grid>
  );
}
