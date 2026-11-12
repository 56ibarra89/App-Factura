import {
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import type { Customer } from "../model/customer.types";
import { useCustomerSearch } from "../hooks/useCustomerSearch";

interface CustomerAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCustomerSelect: (customer: Customer | null) => void;
}

export default function CustomerAutocomplete({
  value,
  onChange,
  onCustomerSelect,
}: CustomerAutocompleteProps) {
  const { suggestions, loading, search } = useCustomerSearch();

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name)}
      inputValue={value}
      filterOptions={(x) => x}
      onInputChange={(_e, newValue) => {
        onChange(newValue);
        search(newValue);
        if (!newValue) onCustomerSelect(null);
      }}
      onChange={(_e, selected) => {
        if (typeof selected === "string") {
          onChange(selected);
          onCustomerSelect(null);
        } else if (selected) {
          onChange(selected.name);
          onCustomerSelect(selected);
        } else {
          onChange("");
          onCustomerSelect(null);
        }
      }}
      loading={loading}
      renderOption={(props, option) => {
        const customer = option as Customer;
        const { key, ...restProps } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
        const primaryAddress = customer.addresses?.[0]?.address;

        return (
          <li key={key} {...restProps}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              py={0.5}
            >
              <Box display="flex" flexDirection="column" gap={0.25}>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  👤 {customer.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                  {customer.phones && customer.phones.length > 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      📞 {customer.phones.map((p) => p.phone).join(" • ")}
                    </Typography>
                  ) : customer.phone ? (
                    <Typography variant="caption" color="text.secondary">
                      📞 {customer.phone}
                    </Typography>
                  ) : null}
                  {primaryAddress && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {primaryAddress}
                    </Typography>
                  )}
                </Box>
              </Box>
              {customer.addresses.length > 0 && (
                <Chip
                  icon={<BookmarkIcon sx={{ fontSize: 12 }} />}
                  label={`${customer.addresses.length} dir.`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ ml: 1, height: 20, fontSize: 10 }}
                />
              )}
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Nombre del Cliente"
          placeholder="Ej: Juan Pérez"
          size="small"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <PersonSearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress size={14} color="inherit" />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
