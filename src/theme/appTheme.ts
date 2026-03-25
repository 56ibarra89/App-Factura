import { createTheme } from "@mui/material/styles";

/**
 * Tema global de la aplicación.
 * Centraliza la paleta corporativa para eliminar colores hardcodeados.
 */
const appTheme = createTheme({
  palette: {
    primary: {
      main: "#d32f2f",
      dark: "#b71c1c",
      light: "#ef5350",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fdfbfb",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default appTheme;
