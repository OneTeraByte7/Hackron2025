import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import 'leaflet/dist/leaflet.css';

Chart.register(PieController, ArcElement, Tooltip, Legend);

const MapWithWasteChart = () => {
  const mapRef = useRef(null);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [showChart, setShowChart] = useState(false);

  // Dark stores data
  const darkStores = [
    { name: 'Store A', lat: 18.5204, lng: 73.8567, waste: { organic: 30, recyclable: 40, nonRecyclable: 30 } },
    { name: 'Store B', lat: 18.5304, lng: 73.8467, waste: { organic: 20, recyclable: 50, nonRecyclable: 30 } },
    { name: 'Store C', lat: 18.5404, lng: 73.8367, waste: { organic: 25, recyclable: 35, nonRecyclable: 40 } },
    { name: 'Store D', lat: 18.5504, lng: 73.8267, waste: { organic: 10, recyclable: 60, nonRecyclable: 30 } },
    { name: 'Store E', lat: 18.5604, lng: 73.8167, waste: { organic: 40, recyclable: 30, nonRecyclable: 30 } }
  ];

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([18.5204, 73.8567], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      darkStores.forEach((store) => {
        const marker = L.circleMarker([store.lat, store.lng], {
          color: 'blue',
          radius: 8
        }).addTo(map);

        marker.bindPopup(
          `<b>${store.name}</b><br>Waste: Organic (${store.waste.organic}%), Recyclable (${store.waste.recyclable}%), Non-Recyclable (${store.waste.nonRecyclable}%)`
        );

        marker.on('click', () => {
          updateChartData(store.waste);
          setShowChart(true);
        });
      });

      mapRef.current = map;
    }
  }, []);

  // Initialize chart
  useEffect(() => {
    if (chartRef.current && !chartInstance) {
      const newChartInstance = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Organic', 'Recyclable', 'Non-Recyclable'],
          datasets: [
            {
              label: 'Waste Types',
              data: [0, 0, 0],
              backgroundColor: ['#4CAF50', '#2196F3', '#F44336']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      setChartInstance(newChartInstance);
    }
  }, [chartRef, chartInstance]);

  // Update chart data
  const updateChartData = (wasteData) => {
    if (chartInstance) {
      chartInstance.data.datasets[0].data = [
        wasteData.organic,
        wasteData.recyclable,
        wasteData.nonRecyclable
      ];
      chartInstance.update();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div id="map" className="flex-grow rounded-md shadow-md"></div>
      {showChart && (
        <div className="fixed bottom-4 right-4 w-80 h-80 bg-white text-black rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-center">Waste Breakdown</h3>
          <canvas ref={chartRef}></canvas>
          <button
            onClick={() => setShowChart(false)}
            className="mt-2 w-full py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default MapWithWasteChart;
