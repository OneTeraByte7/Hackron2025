import React, { useState } from 'react';

const ExpiryPredictor = () => {
    const [productName, setProductName] = useState('');
    const [manufacturingDate, setManufacturingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [salesImpact, setSalesImpact] = useState(null);
    const [discount, setDiscount] = useState(null);
    const [marketDemand, setMarketDemand] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handlePredict = () => {
        setErrorMessage('');

        if (!manufacturingDate || !expiryDate || !productName) {
            setErrorMessage("Please enter valid product name, manufacturing date, and expiry date.");
            return;
        }

        const mDate = new Date(manufacturingDate).getTime();
        const eDate = new Date(expiryDate).getTime();

        if (isNaN(mDate) || isNaN(eDate) || eDate <= mDate) {
            setErrorMessage("Please enter valid manufacturing and expiry dates.");
            return;
        }

        // 🔥 Completely random predictions for fun
        setPrediction((Math.random() * 10).toFixed(1)); 
        setSalesImpact((Math.random() * 100).toFixed(1));  
        setDiscount((Math.random() * 50).toFixed(1));  
        setMarketDemand((Math.random() * 10).toFixed(1));  
    };

    return (
        <div className="bg-gray-900 min-h-screen p-8 flex flex-col items-center">
            <h1 className="text-3xl text-white mb-6">Expiry Date Predictor</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
                <div className="mb-4">
                    <label className="block text-white mb-2">Product Name:</label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                        placeholder="Enter product name"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-white mb-2">Manufacturing Date:</label>
                    <input
                        type="date"
                        value={manufacturingDate}
                        onChange={(e) => setManufacturingDate(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-white mb-2">Expiry Date:</label>
                    <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                    />
                </div>
                <button
                    onClick={handlePredict}
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition">
                    Give Prediction
                </button>
                {prediction !== null && (
                    <div className="mt-4 text-white text-center">
                        <p>📊 Predicted Score: <span className="font-bold">{prediction} points</span></p>
                        <p>📈 Sales Impact: <span className="font-bold">{salesImpact}%</span></p>
                        <p>💰 Recommended Discount: <span className="font-bold">{discount}%</span></p>
                        <p>🔥 Market Demand Impact: <span className="font-bold">{marketDemand} / 10</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpiryPredictor;
