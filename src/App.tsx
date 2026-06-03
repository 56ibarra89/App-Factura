import { HashRouter } from "react-router-dom";
import AppRoutes from "./router/index.tsx";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useGeneralConfigData } from "./hooks/useGeneralConfigData";
import getAppTheme from "./theme/appTheme";

function App() {
  const { config } = useGeneralConfigData();
  const theme = getAppTheme(config.theme || 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
