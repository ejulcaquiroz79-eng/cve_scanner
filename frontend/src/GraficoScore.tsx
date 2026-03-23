import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { Vulnerabilidad } from "./types";

ChartJS.register(ArcElement, Tooltip, Legend);

export function GraficoScore({ data }: { data: Vulnerabilidad[] }) {
  if (data.length === 0) {
    return <p>No hay datos suficientes para calcular el score promedio.</p>;
  }

  const promedio =
    data.reduce((acc, v) => acc + v.score, 0) / data.length;

  const chartData = {
    labels: ["Score promedio"],
    datasets: [
      {
        data: [promedio, 10 - promedio],
        backgroundColor: ["#38bdf8", "#1e293b"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ width: "250px", margin: "0 auto" }}>
      <Doughnut data={chartData} options={options} />
      <p style={{ textAlign: "center", marginTop: "10px", fontSize: "18px" }}>
        {promedio.toFixed(2)} / 10
      </p>
    </div>
  );
}
