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
import { useEffect, useRef } from "react";
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
  const chartRef = useRef<any>(null);
  const theme = document.documentElement.getAttribute("data-theme");

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  if (data.length === 0) {
    return <p>No hay datos suficientes para generar el gráfico.</p>;
  }

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--text").trim();
  const lineColor = styles.getPropertyValue("--chart-line").trim();

  const conteoPorFecha: Record<string, number> = {};
  data.forEach((v) => {
    const fecha = v.fecha_detectado.split("T")[0];
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
        borderColor: lineColor,
        backgroundColor: lineColor + "33",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: "#0EA5E9" } },
      y: {
        ticks: {
          color: "#0EA5E9",
          stepSize: 1,
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  return <Line key={theme} ref={chartRef} data={chartData} options={options} />;
}

