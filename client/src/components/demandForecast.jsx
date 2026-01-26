import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const DemandForecast = ({ product: initialProduct }) => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(initialProduct || 'Milk');
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelPath, setModelPath] = useState(null);

  useEffect(() => {
    // fetch product list
    axios.get('/api/products')
      .then(res => {
        const all = [];
        ['red', 'yellow', 'green'].forEach(k => {
          const arr = res.data[k] || [];
          arr.forEach(item => {
            const name = item.product_name || item['Product Name'] || item.product || item.product_id;
            if (name && !all.includes(name)) all.push(name);
          });
        });
        setProducts(all);
        if (!initialProduct && all.length) setProduct(all[0]);
      })
      .catch(() => {});
  }, [initialProduct]);

  const loadForecast = (p) => {
    setLoading(true);
    setError(null);
    axios.get(`/api/forecasts/latest?product=${encodeURIComponent(p)}`)
      .then(res => {
        setForecast(res.data.forecast || []);
        setModelPath(res.data.model_path || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data || err.message);
        setForecast([]);
        setModelPath(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (product) loadForecast(product);
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    setLoading(true);
    axios.get(`/api/forecasts/save?product=${encodeURIComponent(product)}`)
      .then(() => loadForecast(product))
      .catch(err => { setError(err.response?.data || err.message); setLoading(false); });
  };

  const dates = forecast.map(f => f.date);
  const preds = forecast.map(f => f.predicted);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Demand Forecast</h2>
        <div className="flex items-center gap-2">
          <select value={product} onChange={e => setProduct(e.target.value)} className="px-3 py-2 rounded bg-gray-800 text-white">
            {products.length === 0 && <option>Loading products...</option>}
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => loadForecast(product)} disabled={loading} className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">Refresh</button>
          <button onClick={handleSave} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>

      <div className="bg-gray-800 text-white rounded shadow p-4">
        {loading && <div className="mb-2">Loading...</div>}
        {error && <div className="text-red-400 mb-2">Error: {JSON.stringify(error)}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gray-900 p-4 rounded">
            <Plot
              data={[{ x: dates, y: preds, type: 'scatter', mode: 'lines+markers', marker: { color: '#60a5fa' }, line: { shape: 'spline' } }]}
              layout={{
                paper_bgcolor: '#0f172a',
                plot_bgcolor: '#0f172a',
                font: { color: '#fff' },
                title: { text: `${product} — Next ${forecast.length} days` },
                xaxis: { title: 'Date' },
                yaxis: { title: 'Predicted Quantity' }
              }}
              style={{ width: '100%', height: '320px' }}
            />
          </div>

          <div className="bg-gray-900 p-4 rounded text-sm">
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="mb-1">Product: <span className="font-bold">{product}</span></p>
            <p className="mb-1">Horizon: <span className="font-bold">{forecast.length} days</span></p>
            <p className="mb-2">Next prediction: <span className="font-bold">{preds[0] ?? '—'}</span></p>
            {modelPath && <p className="break-words">Model: <span className="font-mono text-xs">{modelPath.split(/[\\/]/).pop()}</span></p>}

            <div className="mt-4">
              <h5 className="font-semibold mb-1">Forecast Values</h5>
              <ul className="list-disc list-inside text-xs max-h-40 overflow-auto">
                {forecast.map(f => <li key={f.date}>{f.date}: {f.predicted}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecast;
