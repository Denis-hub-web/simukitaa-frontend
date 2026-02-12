import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StockInventoryTable = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    // Modal functionality disabled

    const navigate = useNavigate();

    const getBaseUrl = () => {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
        const hostname = window.location.hostname;
        return (hostname === 'localhost' || hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : `http://${hostname}:5000/api`;
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${getBaseUrl()}/stock-inventory`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setInventory(response.data.data.inventory);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            setLoading(false);
        }
    };

    const getConditionBadge = (conditions) => {
        if (!conditions) return <span className="text-xs text-gray-400">-</span>;

        const badges = [];
        if (conditions.nonActive > 0) badges.push({ label: conditions.nonActive, text: 'Non-Active', color: 'text-blue-700 bg-blue-50' });
        if (conditions.active > 0) badges.push({ label: conditions.active, text: 'Active', color: 'text-green-700 bg-green-50' });
        if (conditions.refurbished > 0) badges.push({ label: conditions.refurbished, text: 'Refurb', color: 'text-amber-700 bg-amber-50' });
        if (conditions.used > 0) badges.push({ label: conditions.used, text: 'Used', color: 'text-gray-700 bg-gray-100' });

        if (badges.length === 0) return <span className="text-xs text-gray-400">None</span>;

        return (
            <div className="flex flex-col gap-1">
                {badges.map((badge, i) => (
                    <div key={i} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${badge.color}`}>
                        <span className="font-bold text-xs">{badge.label}</span>
                        <span className="text-[10px] font-medium opacity-75">{badge.text}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-5xl text-blue-600 animate-spin mb-3" />
                    <p className="text-gray-600 font-semibold">Loading inventory...</p>
                </div>
            </div>
        );
    }

    const totalValue = inventory.reduce((sum, item) => sum + item.stockValue, 0);
    const totalStock = inventory.reduce((sum, item) => sum + item.inStock, 0);

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* Modern Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[95%] mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700 text-sm" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Inventory</h1>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">{inventory.length} variants • {totalStock} units in stock</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Value</p>
                                <p className="text-xl font-bold text-gray-900">{totalValue.toLocaleString()} <span className="text-sm text-gray-500 font-normal">TSh</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Table Container */}
            <div className="max-w-[95%] mx-auto px-6 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Minimal Header */}
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Variant</span>
                                    </th>
                                    <th className="px-5 py-3 text-left">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Condition</span>
                                    </th>
                                    <th className="px-5 py-3 text-center">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">In Stock</span>
                                    </th>
                                    <th className="px-5 py-3 text-center">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Sold</span>
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Value (TSh)</span>
                                    </th>
                                </tr>
                            </thead>

                            {/* Zebra Rows */}
                            <tbody className="divide-y divide-gray-100">
                                {inventory.map((item, index) => {
                                    const isEven = index % 2 === 0;
                                    const isOutOfStock = item.status === 'OUT_RESTOCK';
                                    const isLow = item.status === 'CRITICAL' || item.status === 'LOW';

                                    return (
                                        <tr
                                            key={index}
                                            className={`
                                                ${isEven ? 'bg-white' : 'bg-gray-50/50'}
                                                ${isOutOfStock ? 'bg-red-50/30' : ''}
                                                ${isLow && !isOutOfStock ? 'bg-amber-50/20' : ''}
                                                hover:bg-blue-50/30 transition-colors
                                            `}
                                        >
                                            {/* Product */}
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-sm text-gray-900">{item.productName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{item.brand}</div>
                                            </td>

                                            {/* Variant */}
                                            <td className="px-5 py-3">
                                                <div className="text-sm font-medium text-gray-800">{item.storage}</div>
                                                <div className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded text-xs font-medium text-purple-700">
                                                    {item.color}
                                                </div>
                                            </td>

                                            {/* Condition */}
                                            <td className="px-5 py-3">
                                                {getConditionBadge(item.conditions)}
                                            </td>

                                            {/* In Stock */}
                                            <td className="px-5 py-3 text-center">
                                                <span className={`
                                                    inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg
                                                    ${item.inStock === 0 ? 'bg-red-100 text-red-700' :
                                                        item.inStock <= 2 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-green-100 text-green-700'}
                                                `}>
                                                    {item.inStock}
                                                </span>
                                            </td>

                                            {/* Sold - Static Display */}
                                            <td className="px-5 py-3 text-center">
                                                <span className={`
                                                    inline-flex items-center justify-center w-12 h-12 rounded-lg
                                                    ${item.sold > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}
                                                    font-bold text-base
                                                `}>
                                                    {item.sold}
                                                </span>
                                            </td>

                                            {/* Value */}
                                            <td className="px-5 py-3 text-right">
                                                <div className="font-semibold text-base text-gray-900">
                                                    {item.stockValue.toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {inventory.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-400 font-medium">No inventory data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockInventoryTable;
