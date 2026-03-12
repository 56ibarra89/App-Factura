import { Box, Grid, Typography } from "@mui/material";

export default function OrderHeader() {
  return (
    <Box sx={{ bgcolor: "#111", color: "white", p: 1.2 }}>
      <Grid container>
        <Grid size={2} textAlign="center">
          <Typography variant="caption" fontWeight="bold">
            CANT
          </Typography>
        </Grid>
        <Grid size={7}>
          <Typography variant="caption" fontWeight="bold">
            DESCRIPCIÓN
          </Typography>
        </Grid>
        <Grid size={3} textAlign="right">
          <Typography variant="caption" fontWeight="bold">
            TOTAL
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
