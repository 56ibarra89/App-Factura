import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Paper,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { LOGIN_COLORS } from "../../../shared/theme";

interface InvoiceFiltersProps {
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  onSearchClick: () => void;
}

const InvoiceFilters = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onSearchClick,
}: InvoiceFiltersProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      }}
    >
      <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(20% - 16px)" }}>
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

        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(20% - 16px)" }}>
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

        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(20% - 16px)" }}>
          <TextField
            select
            fullWidth
            label="Método de Pago"
            value={selectedPaymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            size="small"
          >
            <MenuItem value="ALL">Todos los métodos</MenuItem>
            <MenuItem value="EFECTIVO">💵 Efectivo</MenuItem>
            <MenuItem value="TARJETA">💳 Tarjeta</MenuItem>
            <MenuItem value="APP">📱 App / Transf.</MenuItem>
            <MenuItem value="MIXTO">🔀 Mixto</MenuItem>
          </TextField>
        </Box>

        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(25% - 16px)" }}>
          <TextField
            fullWidth
            placeholder="Buscar por cliente, cajero o ID..."
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
              height: 40,
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Buscar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default InvoiceFilters;
