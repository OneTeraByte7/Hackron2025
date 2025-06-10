import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// API to fetch categorized products
app.get('/api/products', (req, res) => {
    const csvData = fs.readFileSync('/server/data/sample_dataset.csv', 'utf8');
    const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true
    });

    // Convert dates to Date objects
    records.forEach(record => {
        record.manufacturing_date = new Date(record.manufacturing_date);
        record.expiry_date = new Date(record.expiry_date);
    });

    // Lists to store red, yellow, and green products
    const red_products = [];
    const yellow_products = [];
    const green_products = [];

    // Calculate the difference in months
    records.forEach(record => {
        const mfg_date = record.manufacturing_date;
        const exp_date = record.expiry_date;
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

    res.json({
        red: red_products,
        yellow: yellow_products,
        green: green_products
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
