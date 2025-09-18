"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeProvider";
import api from "@/lib/axios";
import Link from "next/link";
import { useParams } from "next/navigation";

const OrderPage = () => {
  const { darkMode } = useTheme();
  
  // Force component to re-render when localStorage changes
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Listen for theme changes in localStorage
  useEffect(() => {
    const handleThemeChange = () => {
      // Force re-render by updating a dummy state
      setMounted(prev => !prev);
    };
    
    // Listen for storage events (theme changes from other tabs/components)
    window.addEventListener('storage', handleThemeChange);
    
    // Also listen for manual localStorage changes in same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const result = originalSetItem.apply(this, arguments);
      if (key === 'theme') {
        setTimeout(handleThemeChange, 0); // Async to avoid infinite loops
      }
      return result;
    };
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);
  
  // Get theme directly from localStorage as backup
  const [localStorageTheme, setLocalStorageTheme] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'true' || theme === '"true"';
      setLocalStorageTheme(isDark);
    }
  }, [mounted]);
  
  // Use localStorage theme if context theme seems wrong
  const effectiveDarkMode = darkMode ?? localStorageTheme;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Define allowed roles
  const ALLOWED_ROLES = ['canteen-vendor', 'stationary-vendor'];

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
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
          console.log("No vendor ID found in session storage");
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        // Role-based access control
        if (!user.role || !ALLOWED_ROLES.includes(user.role)) {
          console.log("User role not authorized:", user.role);
          console.log("Allowed roles:", ALLOWED_ROLES);
          setAccessDenied(true);
          setError("Access denied. This page is only accessible to canteen and stationary vendors.");
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setVendorId(user._id);
        console.log("Fetching orders for vendor ID:", user._id);

        // Make API call - you might need to adjust this endpoint
        const response = await api.get(`/vendor/orders`);
        console.log("Full API response:", response);
        console.log("Response data:", response.data);

        // Handle different possible response structures
        let orderList = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            orderList = response.data;
          } else if (response.data.orders) {
            orderList = response.data.orders;
          } else if (response.data.data) {
            orderList = response.data.data;
          }
        }

        console.log("Extracted order list:", orderList);
        console.log("Order list length:", orderList?.length);

        const finalOrders = Array.isArray(orderList) ? orderList : [];
        setOrders(finalOrders);

        if (finalOrders.length === 0) {
          console.log("No orders found for this vendor");
        }

      } catch (err) {
        console.error("Error fetching orders:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response);
        console.error("Error response data:", err.response?.data);
        
        // Handle specific API errors
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setAccessDenied(true);
          setError("Access forbidden. You don't have permission to view these orders.");
        } else {
          setError(`Failed to fetch orders: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, []);

  // Calculate order total safely
  const calculateOrderTotal = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    
    return order.items.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const baseClasses = effectiveDarkMode ? 'text-xs font-semibold px-3 py-1 rounded-full' : 'text-xs font-semibold px-3 py-1 rounded-full';
    
    switch (status?.toLowerCase()) {
      case 'pending':
        return effectiveDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return effectiveDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
      case 'shipped':
      case 'out for delivery':
        return effectiveDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed':
        return effectiveDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return effectiveDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      default:
        return effectiveDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${effectiveDarkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading orders...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className={`text-center ${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 max-w-md`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Access Denied</h2>
          <p className={`${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>This page is restricted to:</p>
          <ul className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <div className="flex flex-col gap-3">
            <Link href="/login" className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}>
              Login with Vendor Account
            </Link>
            <Link href="/dashboard" className={`${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'} px-6 py-2 rounded-lg transition-colors`}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className={`text-center ${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 max-w-md`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Error</h2>
          <p className={`${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>{error}</p>
          <Link href="/login" className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>All Orders</h1>
            <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>Manage and track your vendor orders</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Link href="/dashboard/order/recent">
              <button className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors flex items-center gap-2`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Orders
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className={`${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors`}>
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        <div className={`${effectiveDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
          <h3 className={`text-sm font-semibold ${effectiveDarkMode ? 'text-yellow-200' : 'text-yellow-800'} mb-2`}>Debug Info:</h3>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Vendor ID: {vendorId}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Orders Count: {orders.length}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Orders Type: {Array.isArray(orders) ? 'Array' : typeof orders}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Dark Mode: {effectiveDarkMode ? 'Enabled' : 'Disabled'}</p>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className={`text-center ${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 transition-colors`}>
            <div className="mb-6">
              <svg className={`w-16 h-16 ${effectiveDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>No Orders Found</h3>
            <p className={`${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>You don't have any orders yet. Orders will appear here once customers start purchasing your products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/dashboard/order/${order._id}`}
                className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700 hover:shadow-gray-900/50' : 'bg-white hover:shadow-2xl'} rounded-2xl shadow-lg p-6 transition-all duration-300 transform hover:-translate-y-1`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg`}>
                      Order #{order._id?.slice(-8) || 'Unknown'}
                    </h3>
                    <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(order.createdAt || order.orderDate)}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <p className={`${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    Customer: {order.userId?.name || order.customerName || 'Unknown Customer'}
                  </p>
                  {order.userId?.email && (
                    <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.userId.email}</p>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Items:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={`${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} flex-1`}>
                          {item.productId?.name || item.productName || 'Unknown Product'} × {item.quantity || 0}
                        </span>
                        <span className={`${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                          ${((item.productId?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    )) || (
                      <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No items found</p>
                    )}
                  </div>
                </div>

                {/* Order Total */}
                <div className={`border-t ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-3`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total:</span>
                    <span className={`font-bold text-lg ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ${calculateOrderTotal(order).toFixed(2)}
                    </span>
                  </div>
                  
                  {order.items?.length && (
                    <p className={`text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Action indicator */}
                <div className={`mt-4 flex items-center ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'} text-sm`}>
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;