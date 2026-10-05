import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dela-gothic-one/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-700.css'
import '@fontsource/zen-kaku-gothic-new/latin-900.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
