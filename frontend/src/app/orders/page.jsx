'use client';

import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Loader, AlertCircle, ArrowRight, ShoppingBag, ShieldX, CheckCircle, Package } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

const AllOrdersPage = () => {
  const { darkMode } = useTheme();
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
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700',
      delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300 dark:border-purple-700',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700',
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
      <div className="min-h-screen flex flex-col relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute inset-0 ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10"
                : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
            } transition-colors duration-300`}
          />
          <div className="absolute top-[-10%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        </div>
        
        <div className="relative flex-1 flex justify-center items-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {accessDenied ? "Checking permissions..." : "Loading your orders..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute inset-0 ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10"
                : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
            } transition-colors duration-300`}
          />
          <div className="absolute top-[-10%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative flex-1 flex items-center justify-center px-4">
          <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md ${
            darkMode
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-white/50 border-gray-200/50"
          } backdrop-blur-md border`}>
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md mx-auto">
                <ShieldX className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Order History Access Denied
            </h2>
            <p className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              This order history page is restricted from:
            </p>
            <ul className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <li>• Canteen Vendors</li>
              <li>• Stationary Vendors</li>
            </ul>
            <p className={`text-xs mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              This is a customer-only page for viewing personal order history.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="/vendor-dashboard" 
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105"
              >
                Go to Vendor Dashboard
              </a>
              <a 
                href="/dashboard" 
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
                }`}
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute inset-0 ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10"
                : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
            } transition-colors duration-300`}
          />
          <div className="absolute top-[-10%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative flex-1 flex flex-col justify-center items-center text-center p-4">
          <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
          <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {error}
          </h2>
          {error.includes("login") ? (
            <div className="flex flex-col gap-3 mt-4">
              <a
                href="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Go to Login
              </a>
              <button
                onClick={() => window.location.reload()}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                    : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
                }`}
              >
                Try Again
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // No orders state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute inset-0 ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10"
                : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
            } transition-colors duration-300`}
          />
          <div className="absolute top-[-10%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
          {/* Debug Info */}
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            darkMode
              ? "bg-green-900/20 border-green-500 text-green-300"
              : "bg-green-50/80 border-green-400 text-green-600"
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold mb-1">✅ Customer Order History Access Granted:</h3>
                <p className="text-xs">User Role: {userRole}</p>
                <p className="text-xs">User ID: {userId}</p>
                <p className="text-xs">Orders Found: 0</p>
                <p className="text-xs">Access Type: Customer order history viewing</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center h-96 text-center p-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md mb-4">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              You have no orders yet.
            </h2>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Looks like you haven't made a purchase.
            </p>
            <a 
              href="/vendor" 
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
          } transition-colors duration-300`}
        />
        <div className="absolute top-[-10%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Debug Info */}
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          darkMode
            ? "bg-green-900/20 border-green-500 text-green-300"
            : "bg-green-50/80 border-green-400 text-green-600"
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold mb-1">✅ Customer Order History Access Granted:</h3>
              <p className="text-xs">User Role: {userRole}</p>
              <p className="text-xs">User ID: {userId}</p>
              <p className="text-xs">Orders Found: {orders.length}</p>
              <p className="text-xs">Access Type: Customer order history viewing</p>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="relative group mx-auto mb-4 inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            My Orders
          </h1>
        </div>

        {/* Orders List */}
        <div className="space-y-4 mb-8">
          {orders.map(order => {
            const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05 + 15;
            return (
              <a 
                key={order._id} 
                href={`/orders/${order._id}`}
                className={`block rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 border ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700/50 hover:border-indigo-600/50"
                    : "bg-white/50 border-gray-200/50 hover:border-indigo-600/50"
                } backdrop-blur-md`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                      Order ID
                    </p>
                    <p className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {order._id}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Date
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Total
                    </p>
                    <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      ₹{total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Items
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-start sm:items-end">
                    <p className={`text-sm font-semibold mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Status
                    </p>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className={`flex items-center justify-end transition-colors ${
                    darkMode ? "text-gray-400 hover:text-indigo-400" : "text-gray-400 hover:text-indigo-600"
                  }`}>
                    <ArrowRight size={20} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        
        {/* Summary Stats */}
        <div className={`p-6 rounded-lg shadow-md border ${
          darkMode
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-white/50 border-gray-200/50"
        } backdrop-blur-md`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Order Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.orderStatus === 'delivered').length}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => ['pending', 'processing'].includes(o.orderStatus)).length}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                ₹{orders.reduce((sum, order) => {
                  const total = order.items.reduce((s, item) => s + item.price * item.quantity, 0) * 1.05 + 15;
                  return sum + total;
                }, 0).toFixed(0)}
              </p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Spent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrdersPage;