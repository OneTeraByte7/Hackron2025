import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
const port = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());  // Enable CORS for all origins
app.use(express.static(path.join(__dirname, '../frontend/build')));  // Serve React build files

// Sample data for the API
const salesData = [
  { product: 'Product A', sold: 100, waste: 10 },
  { product: 'Product B', sold: 200, waste: 30 },
  { product: 'Product C', sold: 150, waste: 20 },
  { product: 'Product D', sold: 250, waste: 40 },
  { product: 'Product E', sold: 300, waste: 50 },
];

// API endpoint to return sales data
app.get('/data', (req, res) => {
  console.log('Request received at /data');
  res.json(salesData);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
