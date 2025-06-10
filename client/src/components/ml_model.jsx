import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const WastePredictionChart = () => {
  const [data, setData] = useState([]);
  const [mse, setMse] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:5000/api/waste-predictions')
      .then(response => {
        setData(response.data.predictions);
        setMse(response.data.mse);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const plotData = [
    {
      x: data.map((_, index) => index + 1),
      y: data.map(point => point.actual),
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'red' },
      name: 'Actual Waste Quantity'
    },
    {
      x: data.map((_, index) => index + 1),
      y: data.map(point => point.predicted),
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'blue' },
      name: 'Predicted Waste Quantity'
    }
  ];

  const layout = {
    title: 'Actual vs Predicted Waste Quantity',
    xaxis: { title: 'Record Index' },
    yaxis: { title: 'Waste Quantity' },
    template: 'plotly_dark',
    margin: { t: 50, l: 50, r: 50, b: 50 }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Waste Prediction Analysis</h2>
      <p className="mb-4 text-center">Mean Squared Error (MSE): <span className="font-mono text-yellow-400">{mse.toFixed(4)}</span></p>
      <Plot data={plotData} layout={layout} className="w-full" />
    </div>
  );
};

export default WastePredictionChart;
