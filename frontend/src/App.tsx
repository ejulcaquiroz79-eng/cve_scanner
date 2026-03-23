import './App.css';
import { useState, useEffect } from 'react';
import { VulnerabilidadesTable } from "./VulnerabilidadesTable";
import type { Vulnerabilidad } from "./types";
import { GraficoSeveridad } from "./GraficoSeveridad";
import { GraficoScore } from "./GraficoScore";
import { GraficoFechas } from "./GraficoFechas";

function App() {
  // -------------------------------
  // TEMA CLARO / OSCURO
  // -------------------------------
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // -------------------------------
  // CARGA DE VULNERABILIDADES
  // -------------------------------
  const [vulns, setVulns] = useState<Vulnerabilidad[]>([]);

  useEffect(() => {
  fetch("http://localhost:9000/reporte")
    .then(res => res.json())
    .then(data => {
      setVulns(data.vulnerabilidades || []);
    })
    .catch(err => {
      console.error("Error cargando datos del backend:", err);
    });
}, []);


  return (
    <div className="app-root">
      <header className="app-header">
        <h1>CVE Scanner Dashboard</h1>
        <p>Resumen de vulnerabilidades detectadas</p>

        {/* BOTÓN DE TEMA */}
        <button
          onClick={toggleTheme}
          className="theme-button"
        >
          Cambiar tema
        </button>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Resumen</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total vulnerabilidades</span>
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
          <h2>Score promedio</h2>
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

export default App;

