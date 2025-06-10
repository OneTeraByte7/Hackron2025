import brain from 'brain.js';
import fs from 'fs';
import path from 'path';

// Sample Data (Replace with actual dataset)
const data = [
    { price: 10.5, weight: 500, manufacturing_date: "2024-01-01", expiry_date: "2024-04-01" },
    { price: 20.0, weight: 1000, manufacturing_date: "2024-02-10", expiry_date: "2024-05-15" },
    { price: 15.5, weight: 750, manufacturing_date: "2024-03-05", expiry_date: "2024-06-10" },
    { price: 7.0, weight: 300, manufacturing_date: "2024-01-20", expiry_date: "2024-03-15" },
    { price: 12.3, weight: 600, manufacturing_date: "2024-02-25", expiry_date: "2024-04-20" }
];

// Convert dates to numerical values (days since epoch)
data.forEach(item => {
    item.manufacturing_date = new Date(item.manufacturing_date).getTime() / 1000;
    item.expiry_date = new Date(item.expiry_date).getTime() / 1000;
});

// Calculate "days_to_expiry" (Target Variable)
const currentDate = Math.floor(Date.now() / 1000); // Get current date as integer
data.forEach(item => {
    item.days_to_expiry = Math.floor((item.expiry_date - currentDate) / (24 * 60 * 60)); // convert from seconds to days
});

// Define Features and Target
const X = data.map(item => [item.expiry_date, item.manufacturing_date]);
const y = data.map(item => item.days_to_expiry);

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

// Evaluate the model
const predictions = X.map(input => net.run(input));
const mae = predictions.reduce((sum, pred, index) => sum + Math.abs(pred[0] - y[index]), 0) / y.length;
console.log(`Mean Absolute Error: ${mae} days`);

// Predict for New Product
const new_product = [new Date("2024-05-01").getTime() / 1000, new Date("2024-03-01").getTime() / 1000];
const predicted_days_to_expiry = net.run(new_product);
console.log(`Predicted Days to Expiry: ${predicted_days_to_expiry[0]} days`);
