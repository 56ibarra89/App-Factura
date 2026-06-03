import { ReactNode } from "react";
import { Box, Paper, Snackbar, Alert } from "@mui/material";
import { LOGIN_GRADIENTS, LOGIN_SHADOWS } from "../../theme/loginTheme";

interface AuthLayoutProps {
  children: ReactNode;
  error?: string;
  onClearError?: () => void;
}

export const AuthLayout = ({ children, error = "", onClearError = () => {} }: AuthLayoutProps) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      bgcolor: 'background.default',
      padding: 2,
      overflow: "auto",
    }}
  >
    <Paper
      elevation={24}
      sx={{
        m: "auto",
        width: { xs: "100%", sm: "95%", md: 950 },
        minHeight: { xs: "auto", md: 650 },
        borderRadius: 6,
        display: "flex",
        overflow: "hidden",
        boxShadow: LOGIN_SHADOWS.card,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {children}
    </Paper>

    <Snackbar
      open={!!error}
      autoHideDuration={4000}
      onClose={onClearError}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClearError}
        severity="error"
        sx={{ width: "100%", fontSize: "1.05rem" }}
      >
        {error}
      </Alert>
    </Snackbar>
  </Box>
);
