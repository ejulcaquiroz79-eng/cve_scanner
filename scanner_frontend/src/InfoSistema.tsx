import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Tipado de la estructura que devuelve tu backend
interface InfoSistemaData {
  arquitectura?: string;
  kernel_version?: string;
  os_contenedor?: string;
  escaneado?: string;
  fecha_detectado?: string;

  interfaces_red?: string[];
  discos_detectados?: string[];
  modulos_kernel?: string[];
}

function InfoSistema() {
  const [data, setData] = useState<InfoSistemaData>({});
  const [loading, setLoading] = useState(true);

  // ⭐ Cargar datos reales del backend
  useEffect(() => {
    fetch("http://localhost:9000/api/drivers")
      .then(res => res.json())
      .then(info => {
        setData(info);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando información del sistema:", err);
        setLoading(false);
      });
  }, []);

  // ⭐ Tema (igual que en Dashboard)
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

  // ⭐ Acordeones
  const [open, setOpen] = useState({
    interfaces: false,
    discos: false,
    modulos: false,
  });

  const toggle = (key: "interfaces" | "discos" | "modulos") => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="app-root">
        <header className="app-header">
          <div>
            <h1>CVE Scanner Dashboard</h1>
            <p>Información del sistema</p>
          </div>

          <button onClick={toggleTheme} className="theme-button">
            Cambiar tema
          </button>

          <Link to="/" className="theme-button">Dashboard</Link>
          <Link to="/nuclei" className="theme-button">Escáner Nuclei</Link>
        </header>

        <main className="app-main">
          <p>Cargando información del sistema...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">

      {/* ⭐ HEADER COMPLETO IGUAL QUE EL DASHBOARD */}
      <header className="app-header">
        <div>
          <h1>CVE Scanner Dashboard</h1>
          <p>Información del sistema</p>
        </div>

        <button onClick={toggleTheme} className="theme-button">
          Cambiar tema
        </button>

        <Link to="/" className="theme-button">Dashboard</Link>
        <Link to="/nuclei" className="theme-button">Escáner Nuclei</Link>
      </header>

      <main className="app-main">

        <section className="card full">
          <h2>Información del sistema</h2>

          <p><strong>Arquitectura:</strong> {data.arquitectura || "N/A"}</p>
          <p><strong>Kernel:</strong> {data.kernel_version || "N/A"}</p>
          <p><strong>OS Contenedor:</strong> {data.os_contenedor || "N/A"}</p>
          <p><strong>IP Escaneada:</strong> {data.escaneado || "N/A"}</p>
          <p><strong>Fecha análisis:</strong> {data.fecha_detectado || "N/A"}</p>

          {/* Interfaces */}
          <h3 onClick={() => toggle("interfaces")} style={{ cursor: "pointer" }}>
            {open.interfaces ? "▼" : "▶"} Interfaces de red ({data.interfaces_red?.length || 0})
          </h3>
          {open.interfaces && (
            <ul>
              {data.interfaces_red?.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          )}

          {/* Discos */}
          <h3 onClick={() => toggle("discos")} style={{ cursor: "pointer" }}>
            {open.discos ? "▼" : "▶"} Discos detectados ({data.discos_detectados?.length || 0})
          </h3>
          {open.discos && (
            <ul>
              {data.discos_detectados?.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          )}

          {/* Módulos */}
          <h3 onClick={() => toggle("modulos")} style={{ cursor: "pointer" }}>
            {open.modulos ? "▼" : "▶"} Módulos del kernel ({data.modulos_kernel?.length || 0})
          </h3>
          {open.modulos && (
            <ul>
              {data.modulos_kernel?.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          )}
        </section>

      </main>
    </div>
  );
}

export default InfoSistema;

