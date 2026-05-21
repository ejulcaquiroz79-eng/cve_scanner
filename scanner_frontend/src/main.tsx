import ReactDOM from 'react-dom/client'
import './index.css'

import App from './App'
import Sistema from './Sistema'
import NucleiScanner from "./NucleiScanner"

// ⭐ Importante: React Router
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>

      {/* Página principal */}
      <Route path="/" element={<App />} />

      {/* Página de drivers */}
      <Route path="/sistema" element={<Sistema />} />

      {/* NUEVA página del escáner Nuclei */}
      <Route path="/nuclei" element={<NucleiScanner />} />

    </Routes>
  </BrowserRouter>
)

