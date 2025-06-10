import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

// Sample Data
const data = [
    { price: 10.5, weight: 500, manufacturing_date: "2024-01-01", expiry_date: "2024-04-01" },
    { price: 20.0, weight: 1000, manufacturing_date: "2024-02-10", expiry_date: "2024-05-15" },
    { price: 15.5, weight: 750, manufacturing_date: "2024-03-05", expiry_date: "2024-06-10" },
    { price: 7.0, weight: 300, manufacturing_date: "2024-01-20", expiry_date: "2024-03-15" },
    { price: 12.3, weight: 600, manufacturing_date: "2024-02-25", expiry_date: "2024-04-20" }
];

app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
    res.json(data);
});

app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});
