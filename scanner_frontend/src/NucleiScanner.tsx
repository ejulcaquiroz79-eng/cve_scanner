import { useState, useEffect } from "react";
import "./App.css";

export default function NucleiScanner() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTemplate, setCurrentTemplate] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // -----------------------------
  //  PROGRESO REAL (SSE)
  // -----------------------------
  const startRealProgress = () => {
    const evtSource = new EventSource("http://localhost:9000/api/nuclei/progress");

    evtSource.onmessage = (event) => {
      if (event.data === "done") {
        setProgress(100);
        setCurrentTemplate("Finalizando...");
        setTimeout(() => setLoading(false), 800);
        evtSource.close();
        return;
      }

      const [total, current, template] = event.data.split("|");

      if (template) setCurrentTemplate(template);

      if (Number(total) > 0) {
        const pct = Math.round((Number(current) / Number(total)) * 100);
        setProgress(pct);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
    };
  };

  // -----------------------------
  //  Ejecutar escaneo automático
  // -----------------------------
  const runAutoScan = async () => {
    setLoading(true);
    setProgress(0);
    setCurrentTemplate("Iniciando...");

    startRealProgress();

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
        // ⭐ Después del escaneo, cargar el resumen limpio
        loadResumen();
        loadHistory();
      }
    } catch (err) {
      console.error("Error ejecutando escaneo automático:", err);
    }
  };

  // -----------------------------
  //  Cargar resumen limpio
  // -----------------------------
  const loadResumen = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/nuclei/resumen");
      const data = await res.json();

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error cargando resumen:", err);
      setResults([]);
    }
  };

  // -----------------------------
  //  Cargar historial
  // -----------------------------
  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:9000/api/nuclei/history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  // -----------------------------
  //  Borrar historial
  // -----------------------------
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
    loadResumen(); // ⭐ Cargar resumen al iniciar
  }, []);

  const colorSeveridad = (sev: string) => {
    const s = sev?.toLowerCase() || "info";
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

        {/* BARRA DE PROGRESO REAL */}
        {loading && (
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">Progreso: {progress}%</p>
            <p className="progress-template">Plantilla: {currentTemplate}</p>
          </div>
        )}

        {/* RESULTADOS DEL ESCÁNER DE NUCLEI */}
        <section className="card full">
          <h2>Resultados del escáner de Nuclei</h2>

          <table className="vuln-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Severidad</th>
                <th>Plantilla</th>
                <th>ID</th>
                <th>Detectado en</th>
                <th>IP</th>
                <th>Puerto</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "10px" }}>
                    No hay resultados aún.
                  </td>
                </tr>
              ) : (
                results.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.nombre || "N/A"}</td>
                    <td>{r.descripcion || "Sin descripción"}</td>

                    <td>
                      <span className={`sev-badge ${colorSeveridad(r.severidad)}`}>
                        {r.severidad || "info"}
                      </span>
                    </td>

                    <td>{r.plantilla || "N/A"}</td>
                    <td>{r.id || "N/A"}</td>
                    <td>{r.detectado_en || "N/A"}</td>
                    <td>{r.ip || "N/A"}</td>
                    <td>{r.puerto || "N/A"}</td>
                    <td>{r.fecha ? r.fecha.split("T")[0] : "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

