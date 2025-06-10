// Phase.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Phase = () => {
    const [redProducts, setRedProducts] = useState([]);
    const [yellowProducts, setYellowProducts] = useState([]);
    const [greenProducts, setGreenProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get('http://localhost:5000/api/products');
                console.log("API Response:", response.data);

                // Destructure response safely
                const { red = [], yellow = [], green = [] } = response.data || {};

                // Sort helper by expiry date (soonest first)
                const sortByExpiry = (a, b) => {
                    const dateA = new Date(a.expiry_date);
                    const dateB = new Date(b.expiry_date);
                    return dateA - dateB;
                };

                setRedProducts(Array.isArray(red) ? red.sort(sortByExpiry) : []);
                setYellowProducts(Array.isArray(yellow) ? yellow.sort(sortByExpiry) : []);
                setGreenProducts(Array.isArray(green) ? green.sort(sortByExpiry) : []);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError('Error fetching products. Please check the backend or API.');
                setRedProducts([]);
                setYellowProducts([]);
                setGreenProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderTable = (products = [], tag) => {
        const tagColor = {
            red: 'text-red-500',
            yellow: 'text-yellow-500',
            green: 'text-green-500'
        }[tag] || 'text-white';

        return (
            <div className="mb-8">
                <h2 className={`text-2xl mb-4 ${tagColor}`}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)} Products
                </h2>

                {products.length === 0 ? (
                    <p className="text-gray-400">No products found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-gray-600">
                            <thead>
                                <tr className="bg-gray-700 text-white">
                                    <th className="p-2 border border-gray-600">Product ID</th>
                                    <th className="p-2 border border-gray-600">Product Name</th>
                                    <th className="p-2 border border-gray-600">Price</th>
                                    <th className="p-2 border border-gray-600">Weight (kg)</th>
                                    <th className="p-2 border border-gray-600">Manufacturing Date</th>
                                    <th className="p-2 border border-gray-600">Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={index} className="odd:bg-gray-800 even:bg-gray-700 text-white">
                                        <td className="p-2 border border-gray-600">{product?.product_id || 'N/A'}</td>
                                        <td className="p-2 border border-gray-600">{product?.product_name || 'N/A'}</td>
                                        <td className="p-2 border border-gray-600">${product?.price ?? 'N/A'}</td>
                                        <td className="p-2 border border-gray-600">{product?.weight ?? 'N/A'}</td>
                                        <td className="p-2 border border-gray-600">{product?.manufacturing_date ? new Date(product.manufacturing_date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="p-2 border border-gray-600">{product?.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <h1 className="text-3xl mb-6 text-center">Product Expiry Tagger</h1>

            {loading ? (
                <p className="text-center text-gray-400">Loading products...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <>
                    {renderTable(redProducts, 'red')}
                    {renderTable(yellowProducts, 'yellow')}
                    {renderTable(greenProducts, 'green')}
                </>
            )}
        </div>
    );
};

export default Phase;
