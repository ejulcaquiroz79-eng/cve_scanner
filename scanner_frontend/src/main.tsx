import ReactDOM from 'react-dom/client'
import './index.css'

import App from './App'

// ⭐ React Router SOLO se usa aquí para envolver App
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

