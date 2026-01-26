import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const NiceBadge = ({ children, className }) => (
  <span className={`text-xs inline-block px-2 py-0.5 rounded-full bg-indigo-600 text-white ${className || ''}`}>{children}</span>
);

export default function DemandForecast() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [allForecasts, setAllForecasts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios.get('/api/products')
      .then(res => {
        const list = [];
        ['red','yellow','green'].forEach(k => {
          (res.data[k]||[]).forEach(item => {
            const name = item._displayName || item.product_name || item['Product Name'] || item.product || item.product_id;
            if (!name) return;
            // keep only items with saved forecasts
            if (item.has_forecast) list.push({ name, tag: item.tag || 'unknown' });
          });
        });
        // unique and sorted
        const uniq = Array.from(new Map(list.map(i => [i.name, i])).values()).sort((a,b)=>a.name.localeCompare(b.name));
        if (mounted) {
          setProducts(uniq);
          // set default selected only if not already selected (functional update avoids referencing `selected`)
          if (uniq.length) setSelected(prev => prev || uniq[0].name);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    axios.get(`/api/forecasts/latest?product=${encodeURIComponent(selected)}`)
      .then(res => {
        setForecast(res.data.forecast || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data || err.message);
        setForecast([]);
        setLoading(false);
      });
  }, [selected]);

  const filtered = useMemo(() => {
    const q = (query||'').trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const handleLoadAll = (days=7) => {
    setLoading(true);
    axios.get(`/api/forecasts/all?days=${days}`)
      .then(res => { setAllForecasts(res.data || {}); setLoading(false); })
      .catch(err => { setError(err.response?.data || err.message); setAllForecasts(null); setLoading(false); });
  };

  const dates = forecast.map(f=>f.date);
  const preds = forecast.map(f=>f.predicted);

  return (
    <div className="w-full bg-[#071022] min-h-screen text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Demand Forecast</h1>
          <p className="text-sm text-gray-300">Short-term demand predictions — pick a product to inspect or load all forecasts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>handleLoadAll(7)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Load All</button>
          <button onClick={()=>{ setSelected(null); setForecast([]); setAllForecasts(null); }} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1 bg-gray-900/90 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." className="flex-1 px-3 py-2 bg-gray-800 rounded text-white outline-none placeholder-gray-400" />
            <NiceBadge>{products.length}</NiceBadge>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-auto">
            {filtered.length === 0 && <div className="text-sm text-gray-300">No products</div>}
            {filtered.map(p => (
              <button key={p.name}
                onClick={()=>setSelected(p.name)}
                className={`w-full text-left p-3 rounded flex items-center justify-between hover:bg-gray-800 transition ${selected===p.name? 'ring-2 ring-indigo-500 bg-gray-800':''}`}>
                <div>
                  <div className="font-medium text-white">{p.name}</div>
                  <div className="text-xs text-gray-300">{p.tag || ''}</div>
                </div>
                <div>
                  <NiceBadge>View</NiceBadge>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="bg-gray-800/90 rounded p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{selected || 'No product selected'}</h2>
                <div className="text-sm text-gray-300">Horizon: {forecast.length} days</div>
              </div>
                      <div className="flex items-center gap-2">
                      <button disabled={!selected || loading} onClick={()=>{ if(selected) { setError(null); axios.get(`/api/forecasts/save?product=${encodeURIComponent(selected)}`).then(()=>{}).catch(err=> setError(err.response?.data || err.message)); } }} className="px-3 py-2 bg-green-600 disabled:opacity-60 rounded text-white">Save</button>
                      <button disabled={!selected || loading} onClick={()=>{ if(selected) { setError(null); axios.get(`/api/forecast?product=${encodeURIComponent(selected)}&days=7`).then(()=>{}).catch(err=> setError(err.response?.data || err.message)); } }} className="px-3 py-2 bg-blue-600 disabled:opacity-60 rounded text-white">Run</button>
                    </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-gray-900 p-3 rounded">
                {loading && <div className="text-sm text-gray-300 mb-2">Loading...</div>}
                {error && <div className="text-sm text-red-400 mb-2">Error: {String(error)}</div>}
                <Plot
                  data={[{ x: dates, y: preds, type: 'scatter', mode:'lines+markers', marker:{color:'#7dd3fc'}, line:{shape:'spline'} }]}
                  layout={{paper_bgcolor:'#071022', plot_bgcolor:'#071022', font:{color:'#fff'}, title: selected ? `${selected} — Next ${forecast.length} days` : 'Select a product', xaxis:{title:'Date'}, yaxis:{title:'Predicted'}}}
                  style={{width:'100%', height:320}}
                />
              </div>

              <div className="bg-gray-900 p-3 rounded text-sm text-gray-200">
                <div className="mb-3">
                  <div className="text-xs text-gray-300">Summary</div>
                  <div className="text-lg font-semibold text-white">{selected || '—'}</div>
                </div>

                <div className="space-y-2">
                  <div>Next: <span className="font-bold">{preds[0] ?? '—'}</span></div>
                  <div>Horizon: <span className="font-bold">{forecast.length} days</span></div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm text-gray-300 mb-2">Values</h4>
                  <ul className="text-xs max-h-40 overflow-auto list-disc list-inside text-gray-200">
                    {forecast.map(f=> <li key={f.date}>{f.date}: {f.predicted}</li> )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {allForecasts && (
            <div className="bg-gray-900 rounded p-4">
              <h3 className="text-lg font-semibold text-white mb-3">All Product Forecasts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(allForecasts).map(([p, data]) => (
                  <div key={p} className="p-3 bg-gray-800 rounded">
                    <div className="font-medium text-white">{p.replace(/_/g,' ')}</div>
                    {data?.forecast ? (
                      <div className="text-xs text-gray-300 mt-1">
                        {data.forecast.slice(0,5).map(it=> <div key={it.date}>{it.date}: {it.predicted}</div>)}
                      </div>
                    ) : (
                      <div className="text-xs text-red-400">{data?.message || 'No data'}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </div>
  );
}

