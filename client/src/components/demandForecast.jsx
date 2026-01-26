import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const DemandForecast = ({ product: initialProduct }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [product, setProduct] = useState(initialProduct || 'Milk');
  const [forecast, setForecast] = useState([]);
  const [allForecasts, setAllForecasts] = useState(null);
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
            const name = item._displayName || item.product_name || item['Product Name'] || item.product || item.product_id;
            const has_history = !!item.has_history;
            if (name && !all.find(x => x.name === name)) all.push({ name, has_history });
          });
        });
        // keep only products that have history for the dropdown
        const withHistory = all.filter(x => x.has_history);
        setProducts(withHistory);
        if (!initialProduct && withHistory.length) setProduct(withHistory[0].name);
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

  const loadAll = (days = 7) => {
    setLoading(true);
    setError(null);
    axios.get(`/api/forecasts/all?days=${encodeURIComponent(days)}`)
      .then(res => {
        setAllForecasts(res.data || {});
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data || err.message);
        setAllForecasts(null);
        setLoading(false);
      });
  };

  const filteredProducts = useMemo(() => {
    if (!products || !products.length) return [];
    const q = String(search || '').trim().toLowerCase();
    return products.filter(p => {
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [products, search]);

  const dates = forecast.map(f => f.date);
  const preds = forecast.map(f => f.predicted);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Demand Forecast</h2>
          <div className="text-sm text-gray-400">Select a product to view short-term demand predictions</div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-800 rounded px-2 py-1 gap-2">
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none w-40 sm:w-60"
            />
            
          </div>

          <select value={product} onChange={e => setProduct(e.target.value)} className="px-3 py-2 rounded bg-gray-800 text-white">
            {products.length === 0 ? (
              <option>Loading products...</option>
            ) : filteredProducts.length === 0 ? (
              <option disabled>No products match</option>
            ) : (
              filteredProducts.map(p => (
                <option key={p.name} value={p.name} disabled={!p.has_history}>
                  {p.name}{!p.has_history ? ' (no history)' : ''}
                </option>
              ))
            )}
          </select>

          <div className="flex items-center gap-2">
            <button onClick={() => loadForecast(product)} disabled={loading || !product} className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">Refresh</button>
            <button onClick={handleSave} disabled={loading || !product} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            <button onClick={() => loadAll(7)} disabled={loading} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Load All</button>
          </div>
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

              <div className="mt-4 text-xs text-gray-400">
                <div>Products available: <span className="font-semibold text-white">{products.length}</span></div>
                <div>Products with history: <span className="font-semibold text-white">{products.filter(p => p.has_history).length}</span></div>
              </div>
            </div>
        </div>
      </div>

      {allForecasts && (
        <div className="mt-6 bg-gray-800 text-white rounded p-4">
          <h3 className="text-lg font-semibold mb-2">All Product Forecasts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-auto">
            {Object.keys(allForecasts).length === 0 && <div className="text-sm">No saved forecasts found.</div>}
            {Object.entries(allForecasts).map(([pname, pdata]) => (
              <div key={pname} className="bg-gray-900 p-3 rounded text-xs">
                <div className="font-semibold mb-1">{pname.replace(/_/g, ' ')}</div>
                {pdata && pdata.forecast ? (
                  <ul className="list-disc list-inside">
                    {pdata.forecast.map(f => <li key={f.date}>{f.date}: {f.predicted}</li>)}
                  </ul>
                ) : (
                  <div className="text-red-400">{pdata?.message || 'No data'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecast;
