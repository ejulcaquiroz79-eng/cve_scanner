import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { Vulnerabilidad } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export function GraficoFechas({ data }: { data: Vulnerabilidad[] }) {
  if (data.length === 0) {
    return <p>No hay datos suficientes para generar el gráfico.</p>;
  }

  // Agrupar vulnerabilidades por fecha_detectado
  const conteoPorFecha: Record<string, number> = {};

  data.forEach((v) => {
    const fecha = v.fecha_detectado.split("T")[0]; // Solo YYYY-MM-DD
    conteoPorFecha[fecha] = (conteoPorFecha[fecha] || 0) + 1;
  });

  const fechas = Object.keys(conteoPorFecha).sort();
  const valores = fechas.map((f) => conteoPorFecha[f]);

  const chartData = {
    labels: fechas,
    datasets: [
      {
        label: "Vulnerabilidades detectadas",
        data: valores,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.3)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#e5e7eb" } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: "#e5e7eb" } },
      y: { ticks: { color: "#e5e7eb" } },
    },
  };

  return <Line data={chartData} options={options} />;
}
