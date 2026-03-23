import type { Vulnerabilidad } from "./types";

export function VulnerabilidadesTable({ data }: { data: Vulnerabilidad[] }) {
  if (data.length === 0) {
    return <p>No hay vulnerabilidades cargadas.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="vuln-table">
        <thead>
          <tr>
            <th>CVE</th>
            <th>Librería</th>
            <th>Versión</th>
            <th>Score</th>
            <th>Severidad</th>
            <th>Fecha detectado</th>
            <th>Fix</th>
            <th>Origen</th>
          </tr>
        </thead>
        <tbody>
          {data.map((v) => (
            <tr key={v.cve}>
              <td>
                <a href={v.enlace} target="_blank" rel="noreferrer">
                  {v.cve}
                </a>
              </td>
              <td>{v.libreria}</td>
              <td>{v.version}</td>
              <td>{v.score}</td>
              <td className={`sev sev-${v.severidad.toLowerCase()}`}>
                {v.severidad}
              </td>
              <td>{v.fecha_detectado}</td>
              <td>{v.fix}</td>
              <td>{v.origen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
