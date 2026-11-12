import {
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import type { EmpresaConfigState } from "../../model/settings.types";

interface CompanyDetailsFormProps {
  config: EmpresaConfigState;
  onChange: (field: keyof EmpresaConfigState, value: string) => void;
}

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "background.default",
  },
};

export default function CompanyDetailsForm({
  config,
  onChange,
}: CompanyDetailsFormProps) {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Nombre Comercial"
          value={config.businessName}
          onChange={(event) => onChange("businessName", event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={fieldStyle}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Teléfono Principal"
          value={config.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={fieldStyle}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Dirección Física"
          value={config.address}
          onChange={(event) => onChange("address", event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={fieldStyle}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Mensaje al Pie del Ticket"
          multiline
          rows={2}
          value={config.ticketFooter}
          onChange={(event) => onChange("ticketFooter", event.target.value)}
          helperText="Agradecimiento o políticas que se imprimirán al final (Ej: '¡Gracias por su compra!')"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ alignSelf: "flex-start", mt: 1.5 }}
                >
                  <ReceiptIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={fieldStyle}
        />
      </Grid>
    </Grid>
  );
}
