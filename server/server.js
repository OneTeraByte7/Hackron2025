import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import brain from 'brain.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // For environment variables

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from public folder (e.g., images, uploads)
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Your API routes (backend logic) here
// Example:
// app.use('/api/users', userRoutes);

// Fallback route for React (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Load CSV Data
const salesData = fs.readFileSync(path.join(__dirname, './data/sales_data.csv'), 'utf8');
const wasteData = fs.readFileSync(path.join(__dirname, './data/waste_data.csv'), 'utf8');
const recyclingData = fs.readFileSync(path.join(__dirname, './data/recycling_data.csv'), 'utf8');
const inventoryData = fs.readFileSync(path.join(__dirname, './data/inventory_data.csv'), 'utf8');
const productData = fs.readFileSync(path.join(__dirname, './data/sample_dataset.csv'), 'utf8');

const salesRecords = parse(salesData, { columns: true, skip_empty_lines: true });
const wasteRecords = parse(wasteData, { columns: true, skip_empty_lines: true });
const recyclingRecords = parse(recyclingData, { columns: true, skip_empty_lines: true });
const inventoryRecords = parse(inventoryData, { columns: true, skip_empty_lines: true });
const productRecords = parse(productData, { columns: true, skip_empty_lines: true });

// API to fetch categorized products
app.get('/api/products', (req, res) => {
    const red_products = [];
    const yellow_products = [];
    const green_products = [];

    productRecords.forEach(record => {
        const mfg_date = new Date(record.manufacturing_date);
        const exp_date = new Date(record.expiry_date);
        const difference_in_months = (exp_date.getFullYear() - mfg_date.getFullYear()) * 12 + exp_date.getMonth() - mfg_date.getMonth();
        if (difference_in_months <= 1) {
            record.tag = "red";
            red_products.push(record);
        } else if (difference_in_months <= 3) {
            record.tag = "yellow";
            yellow_products.push(record);
        } else {
            record.tag = "green";
            green_products.push(record);
        }
    });

    res.json({ red: red_products, yellow: yellow_products, green: green_products });
});

// Merge data for neural network
const mergedData = salesRecords.map(sale => {
    const product = productRecords.find(item => item['product_name'] === sale['product_name']);
    const inventory = inventoryRecords.find(item => item['product_name'] === sale['product_name']);
    const waste = wasteRecords.find(item => item['Product Name'] === sale['Product Name']);
    const recycling = recyclingRecords.find(item => item['Sale Date'] === sale['Sale Date']);
    return { ...sale, ...inventory, ...waste, ...recycling };
});

// Convert columns to numeric
mergedData.forEach(record => {
    for (const key in record) {
        if (record[key]) {
            record[key] = parseFloat(record[key].replace(/[^\d.]/g, '')) || 0;
        }
    }
});

// Prepare data for brain.js
const X = mergedData.map(record => [record['Quantity Sold'], record['Stock Level'], record['Quantity_x'], record['Quantity_y']]);
const y = mergedData.map(record => record['Quantity_x']);

const trainingData = X.map((input, index) => ({ input, output: [y[index]] }));

const net = new brain.NeuralNetwork({ hiddenLayers: [10] });
net.train(trainingData, { iterations: 20000, log: true, logPeriod: 1000, learningRate: 0.01 });

const predictions = X.map(input => net.run(input));
const mse = predictions.reduce((sum, pred, index) => sum + Math.pow(pred[0] - y[index], 2), 0) / y.length;

app.get('/api/waste-predictions', (req, res) => {
    const predictionsData = X.map((input, index) => ({
        actual: y[index],
        predicted: predictions[index][0]
    }));
    res.json({ predictions: predictionsData, mse });
});

// Visualization Data
app.get('/api/visualizations', (req, res) => {
    const figSales = {
        data: [{
            x: salesRecords.map(record => record['Sale Date']),
            y: salesRecords.map(record => record['Quantity Sold']),
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'blue' },
            name: 'Sales'
        }],
        layout: { title: 'Sales Over Time', template: 'plotly_dark' }
    };

    const figWaste = {
        data: [{
            x: wasteRecords.map(record => record['Disposal Date']),
            y: wasteRecords.map(record => record['Quantity']),
            type: 'bar',
            marker: { color: 'red' },
            name: 'Waste'
        }],
        layout: { title: 'Waste Over Time', template: 'plotly_dark' }
    };

    const figRecycling = {
        data: [{
            labels: recyclingRecords.map(record => record['Material']),
            values: recyclingRecords.map(record => record['Quantity']),
            type: 'pie',
            name: 'Recycling'
        }],
        layout: { title: 'Recycling Distribution', template: 'plotly_dark' }
    };

    const figInventory = {
        data: [{
            x: inventoryRecords.map(record => record['Product Name']),
            y: inventoryRecords.map(record => record['Stock Level']),
            type: 'bar',
            marker: { color: 'green' },
            name: 'Inventory'
        }],
        layout: { title: 'Current Inventory Levels', template: 'plotly_dark' }
    };

    res.json({ figSales, figWaste, figRecycling, figInventory });
});

// Sample Data API
const sampleData = [
    { price: 10.5, weight: 500, manufacturing_date: "2024-01-01", expiry_date: "2024-04-01" },
    { price: 20.0, weight: 1000, manufacturing_date: "2024-02-10", expiry_date: "2024-05-15" },
    { price: 15.5, weight: 750, manufacturing_date: "2024-03-05", expiry_date: "2024-06-10" }
];

app.get('/api/data', (req, res) => res.json(sampleData));

// Sales Data API
const salesDataAPI = [
    { product: 'Product A', sold: 100, waste: 10 },
    { product: 'Product B', sold: 200, waste: 30 }
];

app.get('/data', (req, res) => res.json(salesDataAPI));

// Health check route
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Start the server (Deployment Ready)
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
