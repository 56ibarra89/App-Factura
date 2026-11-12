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
      default: mode === "dark" ? "#121212" : "#f8fafc",
      paper: mode === 'dark' ? "#1e1e1e" : "#ffffff",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: "none",
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: "none",
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.action.hover,
          fontWeight: 700,
        }),
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
