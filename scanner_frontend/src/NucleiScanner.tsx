import { useState, useEffect } from "react";
import "./App.css";

export default function NucleiScanner() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  // Ejecutar escaneo automático (sin target)
  const runAutoScan = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:9000/api/nuclei/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const data = await res.json();

      if (data.error) {
        alert("Error ejecutando el escaneo automático");
      } else {
        setResults(data.results || []);
        loadHistory();
      }
    } catch (err) {
      console.error("Error ejecutando escaneo automático:", err);
    }

    setLoading(false);
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/nuclei/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  const clearHistory = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/nuclei/clear-history", {
        method: "POST",
      });

      const data = await res.json();

      if (data.status === "ok") {
        setHistory([]);
        alert("Historial eliminado");
      }
    } catch (error) {
      console.error("Error al borrar historial:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const colorSeveridad = (sev: string) => {
    const s = sev.toLowerCase();
    if (s === "critical") return "sev-critical";
    if (s === "high") return "sev-high";
    if (s === "medium") return "sev-medium";
    if (s === "low") return "sev-low";
    return "sev-info";
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>Escáner Nuclei</h1>
          <p>Detección avanzada de vulnerabilidades con plantillas Nuclei</p>
        </div>

        <a href="/" className="theme-button">Volver al dashboard</a>
      </header>

      <main className="app-main">

        {/* BOTÓN DE ESCANEO AUTOMÁTICO */}
        <section className="card full">
          <h2>Ejecutar escaneo</h2>

          <button
            onClick={runAutoScan}
            className="theme-button"
            disabled={loading}
            style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            {loading && (
              <div className="spinner" style={{
                width: "18px",
                height: "18px",
                border: "3px solid #fff",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }}></div>
            )}
            {loading ? "Escaneando..." : "Escanear este equipo"}
          </button>
        </section>

        {/* RESULTADOS */}
        <section className="card full">
          <h2>Resultados del escaneo</h2>

          {results.length === 0 ? (
            <p>No hay resultados aún.</p>
          ) : (
            <table className="vuln-table">
              <thead>
                <tr>
                  <th>Plantilla</th>
                  <th>Severidad</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.template}</td>
                    <td>
                      <span className={`sev-badge ${colorSeveridad(r.severity)}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td>{r.description || "Sin descripción"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* HISTORIAL */}
        <section className="card full">
          <h2>Historial de escaneos</h2>

          <button
            onClick={clearHistory}
            className="theme-button"
            style={{ marginBottom: "10px" }}
          >
            Borrar historial
          </button>

          {history.length === 0 ? (
            <p>No hay historial registrado.</p>
          ) : (
            <table className="vuln-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Objetivo</th>
                  <th>Resultados</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h: any, i: number) => (
                  <tr key={i}>
                    <td>{h.timestamp}</td>
                    <td>{h.target}</td>
                    <td>{h.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

      </main>
    </div>
  );
}

