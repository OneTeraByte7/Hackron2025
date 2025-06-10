import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Enable CORS to allow requests from React frontend
app.use(cors());

// Load data
const salesData = fs.readFileSync(path.join(__dirname, 'sales_data.csv'), 'utf8');
const wasteData = fs.readFileSync(path.join(__dirname, 'waste_data.csv'), 'utf8');
const recyclingData = fs.readFileSync(path.join(__dirname, 'recycling_data.csv'), 'utf8');
const inventoryData = fs.readFileSync(path.join(__dirname, 'inventory_data.csv'), 'utf8');

const salesRecords = parse(salesData, { columns: true, skip_empty_lines: true });
const wasteRecords = parse(wasteData, { columns: true, skip_empty_lines: true });
const recyclingRecords = parse(recyclingData, { columns: true, skip_empty_lines: true });
const inventoryRecords = parse(inventoryData, { columns: true, skip_empty_lines: true });

// Create visualizations
const figSales = {
  data: [{
    x: salesRecords.map(record => record['Sale Date']),
    y: salesRecords.map(record => record['Quantity Sold']),
    type: 'scatter',
    mode: 'lines',
    marker: { color: 'blue' },
    name: 'Sales'
  }],
  layout: {
    title: 'Sales Over Time',
    template: 'plotly_dark'
  }
};

const figWaste = {
  data: [{
    x: wasteRecords.map(record => record['Disposal Date']),
    y: wasteRecords.map(record => record['Quantity']),
    type: 'bar',
    marker: { color: 'red' },
    name: 'Waste'
  }],
  layout: {
    title: 'Waste Over Time',
    template: 'plotly_dark'
  }
};

const figRecycling = {
  data: [{
    labels: recyclingRecords.map(record => record['Material']),
    values: recyclingRecords.map(record => record['Quantity']),
    type: 'pie',
    name: 'Recycling'
  }],
  layout: {
    title: 'Recycling Distribution',
    template: 'plotly_dark'
  }
};

const figInventory = {
  data: [{
    x: inventoryRecords.map(record => record['Product Name']),
    y: inventoryRecords.map(record => record['Stock Level']),
    type: 'bar',
    marker: { color: 'green' },
    name: 'Inventory'
  }],
  layout: {
    title: 'Current Inventory Levels',
    template: 'plotly_dark'
  }
};

// API endpoint to fetch visualizations
app.get('/api/visualizations', (req, res) => {
  res.json({
    figSales,
    figWaste,
    figRecycling,
    figInventory
  });
});

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
