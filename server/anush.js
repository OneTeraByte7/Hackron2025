import express from "express";
import cors from "cors";
import fs from "fs";
import csv from "csv-parser";
import * as math from "mathjs";
import * as danfo from "danfojs-node";
import * as simpleStats from "simple-statistics";

const app = express();
app.use(cors()); // Enable CORS
const PORT = 5000;

app.get("/api/analyze", (req, res) => {
  let data = [];

  fs.createReadStream("C:/Users/Lenovo/Downloads/product_sales_data.csv")
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", () => {
      let df = new danfo.DataFrame(data);
      df = df.sort_values("DaysUntilExpiry");

      // Compute correlations for different categories
      const categories = ["Eggs and Meat", "Vegetables", "Dairy Products"];
      let correlations = {};

      categories.forEach((category) => {
        let filteredData = df.query(df["Category"].eq(category));
        if (filteredData["Sales"].values.length > 1) {
          let correlation = math.corr(
            filteredData["Sales"].values,
            filteredData["DaysUntilExpiry"].values
          );
          correlations[category] = correlation;
        } else {
          correlations[category] = "Not enough data";
        }
      });

      // Linear Regression Prediction
      const X = df["DaysUntilExpiry"].values;
      const y = df["Sales"].values;
      let regression = simpleStats.linearRegression(X, y);
      let regressionLine = simpleStats.linearRegressionLine(regression);
      let predictedSales = regressionLine(30); // Prediction for 30 days

      // Send JSON response
      res.json({
        correlations,
        predictedSales,
        salesData: {
          x: df["DaysUntilExpiry"].values,
          y: df["Sales"].values,
        },
      });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});