'use client';

import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios'; // Corrected path for the custom axios instance
import { Loader, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        // This endpoint should return all orders for the authenticated user
        const response = await axios.get('/order'); 
        // Sort orders to show the most recent first
        const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch your orders.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <Loader className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500 dark:text-red-400" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{error}</h2>
      </div>
    );
  }
  
  if (orders.length === 0) {
      return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white dark:bg-gray-900">
        <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">You have no orders yet.</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't made a purchase.</p>
        <a href="/" className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {orders.map(order => {
            const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05 + 15;
            return (
              <a 
                key={order._id} 
                href={`/orders/${order._id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-500">Order ID</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{order._id}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Date</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Total</p>
                    <p className="text-sm font-bold">₹{total.toFixed(2)}</p>
                  </div>
                   <div className="flex-1 flex flex-col items-start sm:items-end">
                     <p className="text-sm font-semibold mb-1">Status</p>
                     <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="flex items-center justify-end text-gray-400">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllOrdersPage;

