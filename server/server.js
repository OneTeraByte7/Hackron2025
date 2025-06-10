import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import brain from 'brain.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
