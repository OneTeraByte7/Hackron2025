import React from 'react';
import { Doughnut, Radar, Bubble, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend);

const WasteVisualization = () => {
    const labels = ['Plastic', 'Food', 'Glass', 'Metal', 'Paper'];
    const wasteAmounts = [500, 300, 200, 150, 400];
    const recyclingRates = [60, 80, 70, 50, 90];
    const impactFactors = [8, 5, 3, 6, 4];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#ffffff' } },
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#ffffff' } },
            x: { ticks: { color: '#ffffff' } },
        },
    };

    return (
        <div className="bg-gray-900 min-h-screen p-8 flex flex-col items-center">
            <h1 className="text-3xl text-white text-center w-full mb-8">Waste Management Insights</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 w-full max-w-6xl">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-80">
                    <h2 className="text-xl text-white mb-4 text-center">Waste Composition</h2>
                    <Doughnut data={{
                        labels,
                        datasets: [{
                            data: wasteAmounts,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#8E44AD'],
                        }]
                    }} options={chartOptions} />
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-80">
                    <h2 className="text-xl text-white mb-4 text-center">Recycling Efficiency</h2>
                    <Bar data={{
                        labels,
                        datasets: [{
                            label: 'Recycling %',
                            data: recyclingRates,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        }]
                    }} options={chartOptions} />
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-80">
                    <h2 className="text-xl text-white mb-4 text-center">Waste Impact Factors</h2>
                    <Bubble data={{
                        datasets: [{
                            label: 'Impact Level',
                            data: labels.map((label, index) => ({ x: index + 1, y: impactFactors[index], r: wasteAmounts[index] / 50 })),
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        }]
                    }} options={chartOptions} />
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-80">
                    <h2 className="text-xl text-white mb-4 text-center">Waste Type Comparison</h2>
                    <Radar data={{
                        labels,
                        datasets: [{
                            label: 'Recycling vs Impact',
                            data: recyclingRates.map((rate, index) => rate - impactFactors[index] * 5),
                            backgroundColor: 'rgba(153, 102, 255, 0.4)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                        }]
                    }} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default WasteVisualization;
