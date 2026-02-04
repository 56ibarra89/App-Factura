import { useState } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordFieldProps {
  label: string;
  helperText?: string;
}

export function PasswordField({ label, helperText }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      fullWidth
      margin="normal"
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShow(!show)}
                edge="end"
              >
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}