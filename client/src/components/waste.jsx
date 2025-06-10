import React from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const WasteCharts = () => {
  // Mock Data for Waste Management
  const labels = ["Apples", "Bananas", "Oranges", "Tomatoes", "Potatoes"];
  const soldQuantities = [100, 150, 120, 110, 200];
  const wasteQuantities = [20, 25, 22, 12, 30];

  // Chart Data Configurations
  const chartDataArray = [
    {
      title: "Waste Percentage (%)",
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Waste Percentage",
            data: wasteQuantities.map((waste, i) =>
              ((waste / soldQuantities[i]) * 100).toFixed(2)
            ),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
    },
    {
      title: "Waste Distribution (Pie Chart)",
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: wasteQuantities,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FFA500"],
            hoverOffset: 6,
          },
        ],
      },
    },
    {
      title: "Sold vs Waste (Line Chart)",
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Sold Quantity",
            data: soldQuantities,
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderWidth: 2,
            fill: true,
          },
          {
            label: "Waste Quantity",
            data: wasteQuantities,
            borderColor: "#FF6384",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderWidth: 2,
            fill: true,
          },
        ],
      },
    },
    {
      title: "Waste Breakdown (Doughnut Chart)",
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: wasteQuantities,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FFA500"],
            hoverOffset: 4,
          },
        ],
      },
    },
  ];

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Prevents automatic stretching
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: { size: 14 },
        },
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#ffffff" },
      },
      x: {
        ticks: { color: "#ffffff" },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeInOutQuad",
    },
  };

  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <h1 className="text-3xl text-white text-center mb-8">Waste Management Visualization</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {chartDataArray.map((chartData, index) => (
          <div
            key={index}
            className="bg-gray-800 p-4 rounded-lg shadow-lg"
            style={{ height: "350px" }} // Fixed height for consistent size
          >
            <h2 className="text-xl text-white mb-4 text-center">{chartData.title}</h2>
            {chartData.type === "bar" && (
              <Bar data={chartData.data} options={chartOptions} height={250} />
            )}
            {chartData.type === "pie" && (
              <Pie data={chartData.data} options={chartOptions} height={250} />
            )}
            {chartData.type === "line" && (
              <Line data={chartData.data} options={chartOptions} height={250} />
            )}
            {chartData.type === "doughnut" && (
              <Doughnut data={chartData.data} options={chartOptions} height={250} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WasteCharts;
