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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export function GraficoFechas() {
  const chartRef = useRef<any>(null);
  const theme = document.documentElement.getAttribute("data-theme");

  const [labels, setLabels] = useState<string[] | null>(null);
  const [values, setValues] = useState<number[] | null>(null);
  const [tendenciaTexto, setTendenciaTexto] = useState<string>("");

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:9000/api/historial")
      .then((res) => res.json())
      .then((data) => {
        setLabels(data.map((h: any) => h.fecha));
        setValues(data.map((h: any) => h.total));
      })
      .catch((err) => console.error("Error cargando historial:", err));
  }, []);

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--text").trim();
  const baseLineColor = styles.getPropertyValue("--chart-line").trim();

  const { tendencia, dynamicColor, texto } = useMemo(() => {
    if (!values || values.length === 0) {
      return { tendencia: [], dynamicColor: baseLineColor, texto: "" };
    }

    const n = values.length;
    const x = values.map((_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const tendencia = x.map((xi) => slope * xi + intercept);

    let dynamicColor = baseLineColor;
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

    return { tendencia, dynamicColor, texto };
  }, [values, baseLineColor]);

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

   const legendColor = "#38BDF8"; // color visible en ambos temas

   const options = {
     responsive: true,
     plugins: {
       legend: {
         position: "top",
         labels: {
           color: legendColor,
           font: {
             size: 16,
             weight: "bold"
           },
           boxWidth: 25,
           boxHeight: 15,
           padding: 20
         }
       },
       tooltip: { enabled: true }
     },
     scales: {
       x: { ticks: { color: legendColor } },
       y: {
         ticks: {
           color: legendColor,
           stepSize: 1,
           precision: 0
         },
        beginAtZero: true
       }
     }
   };



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

      <Line key={theme} ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

