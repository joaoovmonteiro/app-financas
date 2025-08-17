import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  title?: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#FFFFFF",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: "#FFFFFF",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        backgroundColor: "#1E1E1E",
        titleColor: "#FFFFFF",
        bodyColor: "#B3B3B3",
        borderColor: "#2A2A2A",
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#B3B3B3",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#2A2A2A",
        },
      },
      y: {
        ticks: {
          color: "#B3B3B3",
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return `R$ ${value.toLocaleString("pt-BR")}`;
          },
        },
        grid: {
          color: "#2A2A2A",
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
      },
    },
  };

  return <Bar data={data} options={options} />;
}
