import express from 'express';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import brain from 'brain.js';
import cors from 'cors';  // Enable CORS
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());  // Enable CORS for all routes

// Load data
const wasteData = fs.readFileSync(path.join(__dirname, 'waste_data.csv'), 'utf8');
const salesData = fs.readFileSync(path.join(__dirname, 'sales_data.csv'), 'utf8');
const recyclingData = fs.readFileSync(path.join(__dirname, 'recycling_data.csv'), 'utf8');
const inventoryData = fs.readFileSync(path.join(__dirname, 'inventory_data.csv'), 'utf8');

const wasteRecords = parse(wasteData, { columns: true, skip_empty_lines: true });
const salesRecords = parse(salesData, { columns: true, skip_empty_lines: true });
const recyclingRecords = parse(recyclingData, { columns: true, skip_empty_lines: true });
const inventoryRecords = parse(inventoryData, { columns: true, skip_empty_lines: true });

// Merge dataframes
const mergedData = salesRecords.map(sale => {
    const inventory = inventoryRecords.find(item => item['Product Name'] === sale['Product Name']);
    const waste = wasteRecords.find(item => item['Product Name'] === sale['Product Name']);
    const recycling = recyclingRecords.find(item => item['Sale Date'] === sale['Sale Date']);
    return {
        ...sale,
        ...inventory,
        ...waste,
        ...recycling
    };
});

// Convert columns to numeric
mergedData.forEach(record => {
    for (const key in record) {
        if (record[key]) {
            record[key] = parseFloat(record[key].replace(/[^\d.]/g, '')) || 0;
        }
    }
});

// Define features and target
const X = mergedData.map(record => [record['Quantity Sold'], record['Stock Level'], record['Quantity_x'], record['Quantity_y']]);
const y = mergedData.map(record => record['Quantity_x']);

// Prepare data for brain.js
const trainingData = X.map((input, index) => ({
    input,
    output: [y[index]]
}));

// Create and train the neural network
const net = new brain.NeuralNetwork({ hiddenLayers: [10] });

net.train(trainingData, {
    iterations: 20000,
    log: true,
    logPeriod: 1000,
    learningRate: 0.01
});

// Predictions and Mean Squared Error
const predictions = X.map(input => net.run(input));
const mse = predictions.reduce((sum, pred, index) => sum + Math.pow(pred[0] - y[index], 2), 0) / y.length;

// API to fetch predictions and MSE
app.get('/api/waste-predictions', (req, res) => {
    const predictionsData = X.map((input, index) => ({
        actual: y[index],
        predicted: predictions[index][0]
    }));

    res.json({
        predictions: predictionsData,
        mse
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
