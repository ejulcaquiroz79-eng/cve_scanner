import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useRef } from "react";
import type { Vulnerabilidad } from "./types";

ChartJS.register(ArcElement, Tooltip, Legend);

export function GraficoScore({ data }: { data: Vulnerabilidad[] }) {
  const chartRef = useRef<any>(null);
  const theme = document.documentElement.getAttribute("data-theme");

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  if (data.length === 0) {
    return <p>No hay datos suficientes para calcular el score promedio.</p>;
  }

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--text").trim();
  const donutColor = styles.getPropertyValue("--chart-donut").trim();

  const promedio =
    data.reduce((acc, v) => acc + v.score, 0) / data.length;

  const chartData = {
    labels: ["Score promedio"],
    datasets: [
      {
        data: [promedio, 10 - promedio],
        backgroundColor: [donutColor, textColor + "22"],
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
      <Doughnut key={theme} ref={chartRef} data={chartData} options={options} />
      <p
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "18px",
          color: "#0EA5E9",
        }}
      >
        {promedio.toFixed(2)} / 10
      </p>
    </div>
  );
}

