import { useState } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordFieldProps {
  label: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  /** Si se proporciona, el toggle externo controla la visibilidad */
  showPassword?: boolean;
  onToggleVisibility?: () => void;
  disabled?: boolean;
}

export function PasswordField({
  label,
  name,
  value,
  onChange,
  helperText,
  showPassword: externalShow,
  onToggleVisibility,
  disabled,
}: PasswordFieldProps) {
  const [internalShow, setInternalShow] = useState(false);

  // Usar estado externo si se proporciona, si no usar interno
  const show = externalShow !== undefined ? externalShow : internalShow;
  const toggleShow = onToggleVisibility ?? (() => setInternalShow((prev) => !prev));

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={show ? "text" : "password"}
      fullWidth
      margin="normal"
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                onClick={toggleShow} 
                edge="end"
                disabled={disabled}
              >
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      disabled={disabled}
    />
  );
}