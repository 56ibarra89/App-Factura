import {
  Box,
  Chip,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface CustomerSearchBarProps {
  value: string;
  resultCount: number;
  onChange: (value: string) => void;
}

export default function CustomerSearchBar({
  value,
  resultCount,
  onChange,
}: CustomerSearchBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 1,
        flexWrap: "wrap",
      }}
    >
      <TextField
        id="admin-clientes-search"
        size="small"
        placeholder="Buscar por nombre o teléfono..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={{ flex: 1, minWidth: 220 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Chip
        label={`${resultCount} cliente${resultCount !== 1 ? "s" : ""}`}
        variant="outlined"
        color="primary"
        size="small"
      />
    </Box>
  );
}
