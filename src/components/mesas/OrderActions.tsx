import { Grid, Button } from "@mui/material";

export default function OrderActions() {
  return (
    <Grid container spacing={1}>
      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#4482ff",
            textTransform: "none",
          }}
        >
          Imprimir factura
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ textTransform: "none" }}
        >
          Editar
        </Button>
      </Grid>

      <Grid size={12}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#4482ff",
            textTransform: "none",
          }}
        >
          Unir Mesa o Mover Pedido
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          sx={{ bgcolor: "#4482ff", textTransform: "none" }}
        >
          Reservar
        </Button>
      </Grid>

      <Grid size={6}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ textTransform: "none" }}
        >
          Salir
        </Button>
      </Grid>
    </Grid>
  );
}
