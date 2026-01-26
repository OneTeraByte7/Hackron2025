import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import brain from 'brain.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import http from 'http';
import https from 'https';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve React build folder as static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Load CSV Data (sync)
const loadCSV = (filename) => {
  const data = fs.readFileSync(path.join(__dirname, './data', filename), 'utf8');
  return parse(data, { columns: true, skip_empty_lines: true });
};

const salesRecords = loadCSV('sales_data.csv');
const wasteRecords = loadCSV('waste_data.csv');
const recyclingRecords = loadCSV('recycling_data.csv');
const inventoryRecords = loadCSV('inventory_data.csv');
const productRecords = loadCSV('sample_dataset.csv');

// API to fetch categorized products by freshness based on months between manufacturing and expiry
app.get('/api/products', (req, res) => {
  const red_products = [];
  const yellow_products = [];
  const green_products = [];

  // Build a set of product names that exist in sales records (history)
  const historySet = new Set();
  salesRecords.forEach(rec => {
    const name = rec['Product Name'] || rec.product_name || rec.product || rec.product_id;
    if (name) historySet.add(String(name));
  });

  productRecords.forEach(record => {
    const mfg_date = new Date(record.manufacturing_date);
    const exp_date = new Date(record.expiry_date);

    // Calculate difference in months (whole months)
    const difference_in_months =
      (exp_date.getFullYear() - mfg_date.getFullYear()) * 12 +
      (exp_date.getMonth() - mfg_date.getMonth());

    // Determine display name and whether it has history
    const name = record.product_name || record['Product Name'] || record.product || record.product_id || '';
    record._displayName = name;
    record.has_history = historySet.has(name);

    if (difference_in_months <= 1) {
      record.tag = 'red';
      red_products.push(record);
    } else if (difference_in_months <= 3) {
      record.tag = 'yellow';
      yellow_products.push(record);
    } else {
      record.tag = 'green';
      green_products.push(record);
    }
  });

  res.json({ red: red_products, yellow: yellow_products, green: green_products });
});

// Merge data for neural network training
const mergedData = salesRecords.map(sale => {
  const product = productRecords.find(item => item.product_name === sale.product_name);
  const inventory = inventoryRecords.find(item => item.product_name === sale.product_name);
  const waste = wasteRecords.find(item => item['Product Name'] === sale['Product Name']);
  const recycling = recyclingRecords.find(item => item['Sale Date'] === sale['Sale Date']);

  return { ...sale, ...product, ...inventory, ...waste, ...recycling };
});

// Convert fields to numbers where possible and clean strings
mergedData.forEach(record => {
  for (const key in record) {
    if (record[key] !== undefined && typeof record[key] === 'string') {
      // Remove all except digits and decimal points before parsing float
      const cleanedValue = record[key].replace(/[^\d.]/g, '');
      record[key] = cleanedValue ? parseFloat(cleanedValue) : 0;
    }
  }
});

// Prepare data for brain.js neural network
// Assumption: keys like 'Quantity Sold', 'Stock Level', 'Quantity_x', 'Quantity_y' are numeric fields
const X = mergedData.map(record => [
  record['Quantity Sold'] || 0,
  record['Stock Level'] || 0,
  record['Quantity_x'] || 0,
  record['Quantity_y'] || 0,
]);

const y = mergedData.map(record => record['Quantity_x'] || 0);

const trainingData = X.map((input, idx) => ({
  input,
  output: [y[idx]],
}));

// Initialize neural network with one hidden layer of 10 neurons
const net = new brain.NeuralNetwork({ hiddenLayers: [10] });

// Train network with specified options
net.train(trainingData, {
  iterations: 20000,
  log: true,
  logPeriod: 1000,
  learningRate: 0.01,
});

// Generate predictions and compute MSE (mean squared error)
const predictions = X.map(input => net.run(input));
const mse =
  predictions.reduce((sum, pred, idx) => sum + Math.pow(pred[0] - y[idx], 2), 0) / y.length;

// Endpoint to get waste predictions and MSE
app.get('/api/waste-predictions', (req, res) => {
  const predictionsData = X.map((input, idx) => ({
    actual: y[idx],
    predicted: predictions[idx][0],
  }));
  res.json({ predictions: predictionsData, mse });
});

// API to provide visualization data in Plotly format
app.get('/api/visualizations', (req, res) => {
  const figSales = {
    data: [
      {
        x: salesRecords.map(record => record['Sale Date']),
        y: salesRecords.map(record => parseFloat(record['Quantity Sold']) || 0),
        type: 'scatter',
        mode: 'lines',
        marker: { color: 'blue' },
        name: 'Sales',
      },
    ],
    layout: { title: 'Sales Over Time', template: 'plotly_dark' },
  };

  const figWaste = {
    data: [
      {
        x: wasteRecords.map(record => record['Disposal Date']),
        y: wasteRecords.map(record => parseFloat(record['Quantity']) || 0),
        type: 'bar',
        marker: { color: 'red' },
        name: 'Waste',
      },
    ],
    layout: { title: 'Waste Over Time', template: 'plotly_dark' },
  };

  const figRecycling = {
    data: [
      {
        labels: recyclingRecords.map(record => record['Material']),
        values: recyclingRecords.map(record => parseFloat(record['Quantity']) || 0),
        type: 'pie',
        name: 'Recycling',
      },
    ],
    layout: { title: 'Recycling Distribution', template: 'plotly_dark' },
  };

  const figInventory = {
    data: [
      {
        x: inventoryRecords.map(record => record['Product Name']),
        y: inventoryRecords.map(record => parseFloat(record['Stock Level']) || 0),
        type: 'bar',
        marker: { color: 'green' },
        name: 'Inventory',
      },
    ],
    layout: { title: 'Current Inventory Levels', template: 'plotly_dark' },
  };

  res.json({ figSales, figWaste, figRecycling, figInventory });
});


// Proxy endpoints to Python ML API (avoid CORS issues by same-origin requests)
const ML_PORT = process.env.ML_API_PORT || '6000';

// Track Python child process so we can restart it if needed
let pyProcess = null;

function spawnPython() {
  if (pyProcess && !pyProcess.killed) return pyProcess;
  try {
    const pythonExec = process.env.PYTHON || 'python';
    pyProcess = spawn(pythonExec, ['flask_api.py'], {
      cwd: __dirname,
      env: { ...process.env, ML_API_PORT: ML_PORT },
      stdio: 'inherit',
    });
    console.log('Spawned Python ML API (PID:', pyProcess.pid, 'on port', ML_PORT + ')');
    pyProcess.on('exit', (code, signal) => {
      console.warn('Python ML API exited', { code, signal });
      pyProcess = null;
    });
    return pyProcess;
  } catch (e) {
    console.error('Failed to spawn Python ML API:', e.message || e);
    pyProcess = null;
    return null;
  }
}

// Ensure Python is started at server boot
spawnPython();


// Global fetch helper used by proxy endpoints (tries global fetch, falls back to http/https)
async function doFetch(u) {
  try {
    if (typeof fetch === 'function') return await fetch(u);
  } catch (e) {
    // ignore and fallback to http/https
  }
  return await new Promise((resolve, reject) => {
    try {
      const parsed = new URL(u);
      const lib = parsed.protocol === 'https:' ? https : http;
      const opts = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
        headers: {}
      };
      const r = lib.request(opts, (resp) => {
        let data = '';
        resp.setEncoding('utf8');
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          const headersObj = {};
          for (const [k, v] of Object.entries(resp.headers)) headersObj[k.toLowerCase()] = Array.isArray(v) ? v.join(',') : v;
          resolve({
            ok: resp.statusCode >= 200 && resp.statusCode < 300,
            status: resp.statusCode,
            text: async () => data,
            headers: { get: (k) => headersObj[k.toLowerCase()] }
          });
        });
      });
      r.on('error', (err) => reject(err));
      r.end();
    } catch (err) { reject(err); }
  });
}

function _safeName(name) {
  return String(name).replace(/[^a-z0-9]/gi, '_');
}

const FORECASTS_DIR = path.join(__dirname, 'forecasts');

app.get('/api/forecasts/latest', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `http://127.0.0.1:${ML_PORT}/api/forecasts/latest?${qs}`;
    // try using global fetch, fall back to http/https request if unavailable
    async function doFetch(u) {
      try {
        if (typeof fetch === 'function') return await fetch(u);
      } catch (e) {
        // continue to http fallback
      }
      return await new Promise((resolve, reject) => {
        try {
          const parsed = new URL(u);
          const lib = parsed.protocol === 'https:' ? https : http;
          const opts = {
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.pathname + (parsed.search || ''),
            method: 'GET',
            headers: {}
          };
          const r = lib.request(opts, (resp) => {
            let data = '';
            resp.setEncoding('utf8');
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
              const headersObj = {};
              for (const [k, v] of Object.entries(resp.headers)) headersObj[k.toLowerCase()] = Array.isArray(v) ? v.join(',') : v;
              resolve({
                ok: resp.statusCode >= 200 && resp.statusCode < 300,
                status: resp.statusCode,
                text: async () => data,
                headers: { get: (k) => headersObj[k.toLowerCase()] }
              });
            });
          });
          r.on('error', (err) => reject(err));
          r.end();
        } catch (err) { reject(err); }
      });
    }

    let resp;
    try {
      resp = await doFetch(url);
      const body = await resp.text();
      const contentType = resp.headers.get('content-type') || 'application/json';
      // If Python returned 200, forward it
      if (resp.ok) return res.status(resp.status).type(contentType).send(body);
      // otherwise fall through to file fallback
      console.warn('Python API returned non-ok status', resp.status);
    } catch (err) {
      console.error('Initial fetch to Python API failed:', err.message || err);
      // Try restarting Python and retry once
      spawnPython();
      await new Promise(r => setTimeout(r, 700));
      try {
        resp = await doFetch(url);
        const body = await resp.text();
        const contentType = resp.headers.get('content-type') || 'application/json';
        if (resp.ok) return res.status(resp.status).type(contentType).send(body);
        console.warn('Python API retry returned non-ok status', resp.status);
      } catch (err2) {
        console.error('Retry fetch to Python API failed:', err2.message || err2);
      }
    }

    // Fallback: try to read the saved forecast JSON from server/forecasts
    try {
      const product = req.query.product || 'unknown';
      const fname = `forecast_${_safeName(product)}.json`;
      const fpath = path.join(FORECASTS_DIR, fname);
      if (fs.existsSync(fpath)) {
        const data = fs.readFileSync(fpath, 'utf8');
        return res.status(200).type('application/json').send(data);
      }
      return res.status(502).json({ error: 'bad_gateway', message: 'Python API unavailable and no saved forecast file' });
    } catch (fileErr) {
      console.error('Fallback file read failed:', fileErr);
      return res.status(502).json({ error: 'bad_gateway', message: fileErr.message || String(fileErr) });
    }
  } catch (err) {
    console.error('Proxy error /api/forecasts/latest:', err);
    res.status(502).json({ error: 'bad_gateway', message: err.message || String(err) });
  }
});

app.get('/api/forecasts/save', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `http://127.0.0.1:${ML_PORT}/api/forecasts/save?${qs}`;
    // use doFetch fallback
    let resp;
    try {
      resp = await doFetch(url);
    } catch (err) {
      console.error('Initial fetch to Python API failed:', err.message || err);
      spawnPython();
      await new Promise(r => setTimeout(r, 700));
      resp = await doFetch(url);
    }
    const body = await resp.text();
    const contentType = resp.headers.get('content-type') || 'application/json';
    res.status(resp.status).type(contentType).send(body);
  } catch (err) {
    console.error('Proxy error /api/forecasts/save:', err);
    res.status(502).json({ error: 'bad_gateway', message: err.message || String(err) });
  }
});

app.get('/api/forecast', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `http://127.0.0.1:${ML_PORT}/api/forecast?${qs}`;
    let resp;
    try {
      resp = await doFetch(url);
    } catch (err) {
      console.error('Initial fetch to Python API failed:', err.message || err);
      spawnPython();
      await new Promise(r => setTimeout(r, 700));
      resp = await doFetch(url);
    }
    const body = await resp.text();
    const contentType = resp.headers.get('content-type') || 'application/json';
    res.status(resp.status).type(contentType).send(body);
  } catch (err) {
    console.error('Proxy error /api/forecast:', err);
    res.status(502).json({ error: 'bad_gateway', message: err.message || String(err) });
  }
});


// Return forecasts for all products (tries Python API, then fallback to saved files)
app.get('/api/forecasts/all', async (req, res) => {
  try {
    const days = req.query.days || '7';
    const url = `http://127.0.0.1:${ML_PORT}/api/forecasts/all?days=${encodeURIComponent(days)}`;
    let resp;
    try {
      resp = await doFetch(url);
      const body = await resp.text();
      const contentType = resp.headers.get('content-type') || 'application/json';
      if (resp.ok) return res.status(resp.status).type(contentType).send(body);
      console.warn('Python API returned non-ok status for /api/forecasts/all', resp.status);
    } catch (err) {
      console.error('Initial fetch to Python API failed for /api/forecasts/all:', err.message || err);
      // Try restarting Python and retry once
      spawnPython();
      await new Promise(r => setTimeout(r, 700));
      try {
        resp = await doFetch(url);
        const body = await resp.text();
        const contentType = resp.headers.get('content-type') || 'application/json';
        if (resp.ok) return res.status(resp.status).type(contentType).send(body);
        console.warn('Python API retry returned non-ok status for /api/forecasts/all', resp.status);
      } catch (err2) {
        console.error('Retry fetch to Python API failed for /api/forecasts/all:', err2.message || err2);
      }
    }

    // Fallback: read all saved forecast files from server/forecasts
    try {
      const files = fs.existsSync(FORECASTS_DIR) ? fs.readdirSync(FORECASTS_DIR) : [];
      const out = {};
      for (const fn of files) {
        if (!fn.startsWith('forecast_') || !fn.endsWith('.json')) continue;
        try {
          const txt = fs.readFileSync(path.join(FORECASTS_DIR, fn), 'utf8');
          const json = JSON.parse(txt);
          const pname = fn.replace(/^forecast_/, '').replace(/\.json$/, '');
          out[pname] = json;
        } catch (readErr) {
          console.warn('Failed to read forecast file', fn, readErr);
        }
      }
      if (Object.keys(out).length) return res.status(200).json(out);
      return res.status(502).json({ error: 'bad_gateway', message: 'Python API unavailable and no saved forecast files' });
    } catch (fileErr) {
      console.error('Fallback read all forecasts failed:', fileErr);
      return res.status(502).json({ error: 'bad_gateway', message: fileErr.message || String(fileErr) });
    }
  } catch (err) {
    console.error('Proxy error /api/forecasts/all:', err);
    res.status(502).json({ error: 'bad_gateway', message: err.message || String(err) });
  }
});

// Sample data API for testing/demo
const sampleData = [
  { price: 10.5, weight: 500, manufacturing_date: '2024-01-01', expiry_date: '2024-04-01' },
  { price: 20.0, weight: 1000, manufacturing_date: '2024-02-10', expiry_date: '2024-05-15' },
  { price: 15.5, weight: 750, manufacturing_date: '2024-03-05', expiry_date: '2024-06-10' },
];

app.get('/api/data', (req, res) => res.json(sampleData));

// Sales Data API (mock)
const salesDataAPI = [
  { product: 'Product A', sold: 100, waste: 10 },
  { product: 'Product B', sold: 200, waste: 30 },
];

app.get('/data', (req, res) => res.json(salesDataAPI));

// Fallback route to serve React app (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start server
// Ensure child Python is cleaned up on exit
const cleanup = () => {
  try { if (pyProcess && !pyProcess.killed) pyProcess.kill(); } catch (e) { }
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(); });
process.on('SIGTERM', () => { cleanup(); process.exit(); });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  if (pyProcess && !pyProcess.killed) console.log(`Python ML API (PID: ${pyProcess.pid}) on port ${ML_PORT}`);
  else console.log('Python ML API not running');
});
