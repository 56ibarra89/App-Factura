import { useState, useEffect } from "react";
import { HashRouter } from "react-router-dom";
import AppRoutes from "./router/index.tsx";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useGeneralConfigData } from "./hooks/useGeneralConfigData";
import getAppTheme from "./theme/appTheme";

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('appfactura_theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
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
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
