import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import brain from 'brain.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

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

  productRecords.forEach(record => {
    const mfg_date = new Date(record.manufacturing_date);
    const exp_date = new Date(record.expiry_date);

    // Calculate difference in months (whole months)
    const difference_in_months =
      (exp_date.getFullYear() - mfg_date.getFullYear()) * 12 +
      (exp_date.getMonth() - mfg_date.getMonth());

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

function _safeName(name) {
  return String(name).replace(/[^a-z0-9]/gi, '_');
}

const FORECASTS_DIR = path.join(__dirname, 'forecasts');

app.get('/api/forecasts/latest', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `http://127.0.0.1:${ML_PORT}/api/forecasts/latest?${qs}`;
    let resp;
    try {
      resp = await fetch(url);
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
        resp = await fetch(url);
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
    let resp;
    try {
      resp = await fetch(url);
    } catch (err) {
      console.error('Initial fetch to Python API failed:', err.message || err);
      spawnPython();
      await new Promise(r => setTimeout(r, 700));
      resp = await fetch(url);
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
      resp = await fetch(url);
    } catch (err) {
      console.error('Initial fetch to Python API failed:', err.message || err);
      spawnPython();
      await new Promise(r => setTimeout(r, 700));
      resp = await fetch(url);
    }
    const body = await resp.text();
    const contentType = resp.headers.get('content-type') || 'application/json';
    res.status(resp.status).type(contentType).send(body);
  } catch (err) {
    console.error('Proxy error /api/forecast:', err);
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
// Launch the Python ML API alongside the Node server
const pythonExec = process.env.PYTHON || 'python';
try {
  const py = spawn(pythonExec, ['flask_api.py'], {
    cwd: __dirname,
    env: { ...process.env, ML_API_PORT: process.env.ML_API_PORT || '6000' },
    stdio: 'inherit',
  });

  // Ensure child process is killed when the Node process exits
  const cleanup = () => {
    try { py.kill(); } catch (e) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(); });
  process.on('SIGTERM', () => { cleanup(); process.exit(); });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Spawned Python ML API (PID: ${py.pid}) on port ${process.env.ML_API_PORT || '6000'}`);
  });
} catch (err) {
  console.error('Failed to start Python ML API:', err);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port} (no Python API)`);
  });
}
