
import bgimg from "../images/bgimg.jpeg";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Plotly from "plotly.js-dist";

const Products = () => {
  const [correlations, setCorrelations] = useState({});
  const [predictedSales, setPredictedSales] = useState(null);
  // Removed unused salesData state

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/analyze")
      .then((response) => {
        const { correlations, predictedSales, salesData } = response.data;
        setCorrelations(correlations);
        setPredictedSales(predictedSales);

        // Plot data
        Plotly.newPlot("plot", [
          {
            x: salesData.x,
            y: salesData.y,
            mode: "markers",
            type: "scatter",
          },
        ], {
          title: "Sales vs Expiry Date",
          xaxis: { title: "Days Until Expiry" },
          yaxis: { title: "Sales" },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);


  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center text-black bg-cover bg-center p-5"
      style={{ backgroundImage: `url(${bgimg})` }} // ✅ Apply Background Image
    >
     <h2 className="text-2xl font-bold mb-4">📊 Product Sales Analysis</h2>

<div id="plot" className="w-full h-96"></div>

<div className="mt-6">
  <h3 className="text-xl font-bold">🧐 Correlation Analysis</h3>
  {Object.keys(correlations).length > 0 ? (
    <ul>
      {Object.entries(correlations).map(([category, corr]) => (
        <li key={category}>
          <strong>{category}:</strong> {typeof corr === "number" ? corr.toFixed(2) : corr}
        </li>
      ))}
    </ul>
  ) : (
    <p>No correlation data available.</p>
  )}
</div>

{predictedSales !== null && (
  <div className="mt-6">
    <h3 className="text-xl font-bold">📈 Sales Prediction</h3>
    <p>Predicted Sales for a product expiring in 30 days: <strong>{predictedSales.toFixed(2)}</strong></p>
  </div>
)}
    </div>
  );
};

export default Products;
