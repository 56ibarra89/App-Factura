import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import App from './App.tsx'
import appTheme from './theme/appTheme.ts'
import { AuthProvider } from './context/AuthContext.tsx'
import { ProductProvider } from './context/ProductContext.tsx'
import { SalesProvider } from './context/SalesContext.tsx'
import { OrderProvider } from './context/OrderContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <ProductProvider>
          <SalesProvider>
            <OrderProvider>
              <App />
            </OrderProvider>
          </SalesProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})