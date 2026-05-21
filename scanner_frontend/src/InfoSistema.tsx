import { useState } from "react";

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

interface Props {
  data: InfoSistemaData;
}

export function InfoSistema({ data }: Props) {
  const [open, setOpen] = useState<{
    interfaces: boolean;
    discos: boolean;
    modulos: boolean;
  }>({
    interfaces: false,
    discos: false,
    modulos: false,
  });

  // Tipamos correctamente las claves permitidas
  const toggle = (key: "interfaces" | "discos" | "modulos") => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: "10px" }}>
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
          {data.interfaces_red?.map((i: string, idx: number) => (
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
          {data.discos_detectados?.map((d: string, idx: number) => (
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
          {data.modulos_kernel?.map((m: string, idx: number) => (
            <li key={idx}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

