import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SciFiDoorLoader from './SciFiDoorLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SciFiDoorLoader>
      <App />
    </SciFiDoorLoader>
  </StrictMode>,
)
