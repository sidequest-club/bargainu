import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anton/latin-400.css'
import '@fontsource-variable/fraunces/soft.css'
import '@fontsource-variable/hanken-grotesk/index.css'
import './styles/tokens.css'
import './styles/fancy.css'
import './styles/base.css'
import './styles/app.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
