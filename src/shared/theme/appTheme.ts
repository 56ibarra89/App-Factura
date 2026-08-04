import { createTheme, PaletteMode } from "@mui/material/styles";
export const getAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: "#d32f2f",
      dark: "#b71c1c",
      light: "#ef5350",
      contrastText: "#ffffff",
    },
    background: {
      default: mode === 'dark' ? "#121212" : "#fdfbfb",
      paper: mode === 'dark' ? "#1e1e1e" : "#ffffff",
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
    MuiModal: {
      defaultProps: {
        disableRestoreFocus: true,
      },
    },
  },
});

export default getAppTheme;
