import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { Vulnerabilidad } from "./types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function GraficoSeveridad({ data }: { data: Vulnerabilidad[] }) {
  const severidades = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const conteo = severidades.map(
    (sev) => data.filter((v) => v.severidad === sev).length
  );

  const chartData = {
    labels: severidades,
    datasets: [
      {
        label: "Cantidad",
        data: conteo,
        backgroundColor: ["#22c55e", "#eab308", "#f97316", "#ef4444"],
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

  return <Bar data={chartData} options={options} />;
}
