import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ProductProvider } from './context/ProductContext.tsx'
import { OrderProvider } from './context/OrderContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <ProductProvider>
            <OrderProvider>
              <App />
            </OrderProvider>
          </ProductProvider>
        </AuthProvider>
      </ErrorBoundary>
  </React.StrictMode>
)

// Use contextBridge
if (window.ipcRenderer) {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
}
