import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ProductProvider } from './context/ProductContext.tsx'
import { SalesProvider } from './context/SalesContext.tsx'
import { CssBaseline } from '@mui/material'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ProductProvider>
    <SalesProvider>
      <React.StrictMode>
        <CssBaseline />
        <App />
      </React.StrictMode>
    </SalesProvider>
  </ProductProvider>  
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})