import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Link } from "react-router-dom";

import { VulnerabilidadesTable } from "./VulnerabilidadesTable";
import type { Vulnerabilidad } from "./types";
import { GraficoSeveridad } from "./GraficoSeveridad";
import { GraficoScore } from "./GraficoScore";
import { GraficoFechas } from "./GraficoFechas";
import InfoSistema from "./InfoSistema";

import NucleiScanner from "./NucleiScanner";

function Dashboard() {

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    fetch("http://localhost:9000/api/scan", { method: "POST" })
      .then(() => console.log("Escaneo ejecutado"))
      .catch(() => console.log("Error ejecutando escaneo"));
  }, []);

  const [vulns, setVulns] = useState<Vulnerabilidad[]>([]);

  useEffect(() => {
    fetch("http://localhost:9000/api/reporte")
      .then(res => res.json())
      .then(data => {
        setVulns(data.results || data.vulnerabilidades || []);
      })
      .catch(err => {
        console.error("Error cargando datos del backend:", err);
      });
  }, []);

  return (
    <div className="app-root">
      
      <header className="app-header">
        <div>
          <h1>CVE Scanner Dashboard</h1>
          <p>Resumen de vulnerabilidades detectadas</p>
        </div>

        <button onClick={toggleTheme} className="theme-button">
          Cambiar tema
        </button>

        <Link to="/sistema" className="theme-button">
          Información de drivers encontrados
        </Link>

        <Link to="/nuclei" className="theme-button">
          Escáner Nuclei
        </Link>

      </header>

      <main className="app-main">

        <section className="card">
          <h2>Resumen</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total de vulnerabilidades: </span>
              <span className="summary-value">{vulns.length}</span>
            </div>
          </div>
        </section>

        <section className="card full">
          <h2>Vulnerabilidades detectadas</h2>
          <VulnerabilidadesTable data={vulns} />
        </section>

        <section className="card">
          <h2>Gráfico por severidad</h2>
          <GraficoSeveridad data={vulns} />
        </section>

        <section className="card">
          <h2>Score Ponderado</h2>
          <GraficoScore data={vulns} />
        </section>

        <section className="card full">
          <h2>Evolución de vulnerabilidades</h2>
          <GraficoFechas data={vulns} />
        </section>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/nuclei" element={<NucleiScanner />} />
      <Route path="/sistema" element={<InfoSistema />} />
      {/* fallback */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

