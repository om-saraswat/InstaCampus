'use client';

import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Loader, AlertCircle, ArrowRight, ShoppingBag, ShieldX } from 'lucide-react';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Define unallowed roles - these roles cannot access this page
  const UNALLOWED_ROLES = ['stationary-vendor', 'canteen-vendor'];

  useEffect(() => {
    const checkAuthAndLoadOrders = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to view your orders.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        console.log("Parsed user:", user);

        // Check if user exists and has required fields
        if (!user?._id) {
          console.log("No user ID found in session storage");
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        // Role-based access control - block vendor roles
        if (user.role && UNALLOWED_ROLES.includes(user.role)) {
          console.log("User role blocked:", user.role);
          console.log("Blocked roles:", UNALLOWED_ROLES);
          setAccessDenied(true);
          setError("Access denied. Vendors cannot access customer order history.");
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setUserId(user._id);
        setUserRole(user.role);

        // Only fetch orders after authentication is successful
        await fetchOrders();

      } catch (err) {
        console.error("Error during authentication check:", err);
        setError("Authentication check failed. Please login again.");
        setLoading(false);
      }
    };

    checkAuthAndLoadOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/order'); 
      const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch your orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
        {status}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {accessDenied ? "Checking permissions..." : "Loading your orders..."}
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center rounded-2xl shadow-lg p-8 max-w-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
          <div className="mb-4">
            <ShieldX className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Order History Access Denied</h2>
          <p className="mb-2 text-gray-600 dark:text-gray-300">
            This order history page is restricted from:
          </p>
          <ul className="text-sm mb-6 text-gray-500 dark:text-gray-400">
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <p className="text-xs mb-6 text-gray-500 dark:text-gray-400">
            This is a customer-only page for viewing personal order history.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/vendor-dashboard" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Go to Vendor Dashboard
            </a>
            <a href="/dashboard" className="px-6 py-2 rounded-lg transition-colors bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500 dark:text-red-400" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{error}</h2>
        {error.includes("login") ? (
          <div className="flex flex-col gap-3 mt-4">
            <a
              href="/login"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }
  
  // No orders state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Debug Info (remove in production) */}
          <div className="mb-6 p-4 rounded-lg border bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200">
            <h3 className="text-sm font-semibold mb-2">✅ Customer Order History Access Granted:</h3>
            <p className="text-xs">User Role: {userRole}</p>
            <p className="text-xs">User ID: {userId}</p>
            <p className="text-xs">Orders Found: 0</p>
            <p className="text-xs">Access Type: Customer order history viewing</p>
          </div>

          <div className="flex flex-col justify-center items-center h-96 text-center p-4">
            <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">You have no orders yet.</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't made a purchase.</p>
            <a href="/vendor" className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Debug Info (remove in production) */}
        <div className="mb-6 p-4 rounded-lg border bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200">
          <h3 className="text-sm font-semibold mb-2">✅ Customer Order History Access Granted:</h3>
          <p className="text-xs">User Role: {userRole}</p>
          <p className="text-xs">User ID: {userId}</p>
          <p className="text-xs">Orders Found: {orders.length}</p>
          <p className="text-xs">Access Type: Customer order history viewing</p>
        </div>

        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {orders.map(order => {
            const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05 + 15;
            return (
              <a 
                key={order._id} 
                href={`/orders/${order._id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border dark:border-gray-700"
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
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Items</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-start sm:items-end">
                    <p className="text-sm font-semibold mb-1">Status</p>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="flex items-center justify-end text-gray-400 hover:text-indigo-500 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.orderStatus === 'delivered').length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => ['pending', 'processing'].includes(o.orderStatus)).length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                ₹{orders.reduce((sum, order) => {
                  const total = order.items.reduce((s, item) => s + item.price * item.quantity, 0) * 1.05 + 15;
                  return sum + total;
                }, 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrdersPage;