import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import { LOGIN_COLORS } from "../../../shared/theme";

interface InvoiceCancellationFiltersProps {
  startDate: string;
  endDate: string;
  searchQuery: string;
  onStartDateChange(value: string): void;
  onEndDateChange(value: string): void;
  onSearchChange(value: string): void;
  onRefresh(): void | Promise<void>;
}

export function InvoiceCancellationFilters({
  startDate,
  endDate,
  searchQuery,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onRefresh,
}: InvoiceCancellationFiltersProps) {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
      >
        <Box
          flex={{
            xs: "1 1 100%",
            sm: "1 1 calc(20% - 16px)",
          }}
        >
          <TextField
            fullWidth
            label="Desde"
            type="date"
            value={startDate}
            onChange={(event) =>
              onStartDateChange(event.target.value)
            }
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <Box
          flex={{
            xs: "1 1 100%",
            sm: "1 1 calc(20% - 16px)",
          }}
        >
          <TextField
            fullWidth
            label="Hasta"
            type="date"
            value={endDate}
            onChange={(event) =>
              onEndDateChange(event.target.value)
            }
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <Box
          flex={{
            xs: "1 1 100%",
            sm: "1 1 calc(45% - 16px)",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por ID, Cliente o Mesa..."
            value={searchQuery}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box
          flex={{
            xs: "1 1 100%",
            sm: "1 1 calc(15% - 16px)",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={onRefresh}
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": {
                bgcolor: LOGIN_COLORS.primaryDark,
              },
              height: 40,
              borderRadius: 2,
            }}
          >
            Buscar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
