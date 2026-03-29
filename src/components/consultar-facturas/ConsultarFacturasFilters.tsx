import { Box, TextField, InputAdornment, Button, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface ConsultarFacturasFiltersProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSearchClick: () => void;
}

const ConsultarFacturasFilters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  onSearchClick
}: ConsultarFacturasFiltersProps) => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(25% - 16px)" }}>
          <TextField
            fullWidth
            label="Desde"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(25% - 16px)" }}>
          <TextField
            fullWidth
            label="Hasta"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(35% - 16px)" }}>
          <TextField
            fullWidth
            placeholder="Buscar por cliente o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(15% - 16px)" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSearchClick}
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
            }}
          >
            Buscar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ConsultarFacturasFilters;
