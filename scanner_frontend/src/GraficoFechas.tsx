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
import { useEffect, useRef, useState, useMemo } from "react";
import type { Vulnerabilidad } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// 🔹 Ahora acepta props correctamente
export function GraficoFechas({ data }: { data: Vulnerabilidad[] }) {
  void data; // <- Evita error TS por no usar la prop

  const chartRef = useRef<any>(null);
  const theme = document.documentElement.getAttribute("data-theme");

  const [labels, setLabels] = useState<string[] | null>(null);
  const [values, setValues] = useState<number[] | null>(null);
  const [tendenciaTexto, setTendenciaTexto] = useState<string>("");

  // 🔹 Guardamos historial original
  const [historialOriginal, setHistorialOriginal] = useState<any[]>([]);

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:9000/api/historial")
      .then((res) => res.json())
      .then((data) => {
        setHistorialOriginal(data);
        setLabels(data.map((h: any) => h.fecha));
        setValues(data.map((h: any) => h.total));
      })
      .catch((err) => console.error("Error cargando historial:", err));
  }, []);

  const legendColor = "#38BDF8";

  // 🔹 Cálculo de tendencia
  const { dynamicColor, texto } = useMemo(() => {
    if (!values || values.length === 0) {
      return { dynamicColor: "#0EA5E9", texto: "" };
    }

    const n = values.length;
    const x = values.map((_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let dynamicColor = "#0EA5E9";
    let texto = "";

    if (slope > 0.05) {
      dynamicColor = "#FF4D4D";
      texto = "🔺 Tendencia en aumento";
    } else if (slope < -0.05) {
      dynamicColor = "#4CAF50";
      texto = "🔻 Tendencia a la baja";
    } else {
      dynamicColor = "#0EA5E9";
      texto = "➖ Tendencia estable";
    }

    return { dynamicColor, texto };
  }, [values]);

  useEffect(() => {
    setTendenciaTexto(texto);
  }, [texto]);

  if (!labels || !values) {
    return <p>Cargando datos...</p>;
  }

  if (labels.length === 0) {
    return <p>No hay datos suficientes para generar el gráfico.</p>;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Vulnerabilidades detectadas",
        data: values,
        borderColor: dynamicColor,
        backgroundColor: dynamicColor + "33",
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: dynamicColor,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: legendColor,
          font: {
            size: 16,
            weight: "bold" as const,   // 🔥 FIX REAL AQUÍ
          },
          boxWidth: 25,
          boxHeight: 15,
          padding: 20,
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: legendColor } },
      y: {
        ticks: {
          color: legendColor,
          stepSize: 1,
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  // ---------------------------------------------------------
  // 🔹 FUNCIONES NUEVAS
  // ---------------------------------------------------------

  const handleReset = async () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar todos los datos? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    await fetch("http://localhost:9000/api/reset", { method: "POST" });

    setLabels([]);
    setValues([]);
  };

  const handlePromedioDia = () => {
    const grupos: any = {};

    historialOriginal.forEach((item) => {
      const fecha = item.fecha.split("T")[0];
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(item.total);
    });

    const promedios = Object.entries(grupos).map(([fecha, valores]: any) => ({
      fecha,
      total: valores.reduce((a: number, b: number) => a + b, 0) / valores.length,
    }));

    setLabels(promedios.map((p) => p.fecha));
    setValues(promedios.map((p) => p.total));
  };

  const handlePromedioSemana = () => {
    const grupos: any = {};

    historialOriginal.forEach((item) => {
      const fecha = new Date(item.fecha);
      const año = fecha.getFullYear();
      const semana = Math.ceil(
        (((fecha.getTime() - new Date(año, 0, 1).getTime()) / 86400000) +
          new Date(año, 0, 1).getDay() +
          1) /
          7
      );

      const clave = `${año}-W${semana}`;

      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(item.total);
    });

    const promedios = Object.entries(grupos).map(([semana, valores]: any) => ({
      fecha: semana,
      total: valores.reduce((a: number, b: number) => a + b, 0) / valores.length,
    }));

    setLabels(promedios.map((p) => p.fecha));
    setValues(promedios.map((p) => p.total));
  };

  const handleVistaOriginal = () => {
    setLabels(historialOriginal.map((h) => h.fecha));
    setValues(historialOriginal.map((h) => h.total));
  };

  // ---------------------------------------------------------

  return (
    <div style={{ width: "100%", maxWidth: "650px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "5px" }}>
        Evolución de vulnerabilidades
      </h3>

      <p
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "15px",
          color: dynamicColor,
          fontSize: "1.1rem",
        }}
      >
        {tendenciaTexto}
      </p>

      <div className="flex gap-3 justify-center my-4">
        <button onClick={handleReset} className="btn">
          Reiniciar datos
        </button>
        <button onClick={handlePromedioDia} className="btn">
          Promedio por día
        </button>
        <button onClick={handlePromedioSemana} className="btn">
          Promedio por semana
        </button>
        <button onClick={handleVistaOriginal} className="btn">
          Vista original
        </button>
      </div>

      <Line key={theme} ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

