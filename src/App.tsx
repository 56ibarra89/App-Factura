import { useState, useEffect } from "react";
import { HashRouter } from "react-router-dom";
import AppRoutes from "./app/router";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import getAppTheme from "./shared/theme";
import {
  getThemePreference,
  type ThemePreference,
} from "./shared/preferences";
import { BackendHealthGuard } from "./modules/health";

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    getThemePreference()
  );

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        theme?: ThemePreference;
      }>;
      if (customEvent.detail?.theme) {
        setThemeMode(customEvent.detail.theme);
      }
    };
    window.addEventListener('appfactura:theme-updated', onUpdated);
    return () => window.removeEventListener('appfactura:theme-updated', onUpdated);
  }, []);

  const theme = getAppTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackendHealthGuard>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </BackendHealthGuard>
    </ThemeProvider>
  );
}

export default App;
