import { StrictMode } from 'react'
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import { ThirdwebProvider } from "thirdweb/react";
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThirdwebProvider>
        <BrowserRouter>
        <App />
        </BrowserRouter>
      </ThirdwebProvider>
  </StrictMode>
)
