import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const DemandForecast = ({ product = 'Milk' }) => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/forecasts/latest?product=${encodeURIComponent(product)}`)
      .then(res => {
        setForecast(res.data.forecast || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data || err.message);
        setLoading(false);
      });
  }, [product]);

  if (loading) return <div className="p-4">Loading forecast...</div>;
  if (error) return <div className="p-4 text-red-400">Error: {JSON.stringify(error)}</div>;

  const dates = forecast.map(f => f.date);
  const preds = forecast.map(f => f.predicted);

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
      <h3 className="text-xl font-bold mb-3">Demand Forecast — {product}</h3>
      <Plot
        data={[{ x: dates, y: preds, type: 'scatter', mode: 'lines+markers', marker: {color: 'blue'} }]}
        layout={{ title: `${product} — Next ${forecast.length} days`, xaxis: { title: 'Date' }, yaxis: { title: 'Predicted Quantity' } }}
      />
    </div>
  );
};

export default DemandForecast;
