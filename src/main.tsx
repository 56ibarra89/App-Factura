import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ProductProvider } from './context/ProductContext.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <ProductProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ProductProvider>  
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})