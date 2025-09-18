"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeProvider";
import api from "@/lib/axios";
import Link from "next/link";

const OrderEditPage = () => {
  const { darkMode } = useTheme();
  const { orderid } = useParams();
  const router = useRouter();
  
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

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Define allowed roles
  const ALLOWED_ROLES = ['canteen-vendor', 'stationary-vendor'];

  useEffect(() => {
    const checkAuthAndFetchOrder = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to view order details.");
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

        if (!orderid) {
          setError("Order ID is missing.");
          setLoading(false);
          return;
        }

        console.log("Fetching order details for:", orderid);

        // Fetch order details
        const response = await api.get(`/order/${orderid}`);
        console.log("API response:", response.data);
        setOrder(response.data.order || response.data);

      } catch (err) {
        console.error("Error fetching order:", err);
        
        // Handle specific API errors
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setAccessDenied(true);
          setError("Access forbidden. You don't have permission to view this order.");
        } else if (err.response?.status === 404) {
          setError("Order not found.");
        } else {
          setError("Failed to load order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrder();
  }, [orderid]);

  // Get status color with dark mode support
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return effectiveDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'processing':
        return effectiveDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
      case 'out for delivery':
        return effectiveDarkMode 
          ? 'bg-purple-900/30 text-purple-400 border-purple-600' 
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
      case 'completed':
        return effectiveDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'rejected':
        return effectiveDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-800 border-red-200';
      default:
        return effectiveDarkMode 
          ? 'bg-gray-700 text-gray-300 border-gray-600' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate order total
  const calculateOrderTotal = () => {
    if (!order?.items || !Array.isArray(order.items)) return 0;
    
    return order.items.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${effectiveDarkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading order details...</p>
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
            <button
              onClick={() => router.back()}
              className={`${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'} px-6 py-2 rounded-lg transition-colors`}
            >
              Go Back
            </button>
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
          <div className="flex flex-col gap-3">
            {error.includes("login") ? (
              <Link href="/login" className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}>
                Go to Login
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className={`text-center ${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 max-w-md`}>
          <div className="mb-4">
            <svg className={`w-16 h-16 ${effectiveDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Order Not Found</h2>
          <p className={`${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 transition-colors`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className={`${effectiveDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-full transition-colors`}
              >
                <svg className={`w-5 h-5 ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className={`text-3xl font-bold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Order Details</h1>
            </div>
            <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>View complete order information</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Link href="/dashboard/order/recent">
              <button className={`${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors`}>
                Recent Orders
              </button>
            </Link>
            <Link href="/dashboard/order">
              <button className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors`}>
                All Orders
              </button>
            </Link>
          </div>
        </div>

        {/* Debug Info */}
        <div className={`${effectiveDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
          <h3 className={`text-sm font-semibold ${effectiveDarkMode ? 'text-yellow-200' : 'text-yellow-800'} mb-2`}>Debug Info:</h3>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Order ID: {orderid}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Vendor ID: {vendorId}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Order Status: {order.orderStatus}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Items Count: {order.items?.length || 0}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Dark Mode: {effectiveDarkMode ? 'Enabled' : 'Disabled'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header Card */}
            <div className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
                    Order #{order._id?.slice(-8)}
                  </h2>
                  <p className={effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}>{formatDate(order.createdAt || order.orderDate)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus || "Pending"}
                </span>
              </div>

              {/* Customer Information */}
              <div className={`border-t ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-4`}>
                <h3 className={`text-lg font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-3`}>Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                    <p className={`font-medium ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{order.userId?.name || "Unknown Customer"}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                    <p className={`font-medium ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{order.userId?.email || "N/A"}</p>
                  </div>
                  {order.userId?.phone && (
                    <div>
                      <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p className={`font-medium ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{order.userId.phone}</p>
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="sm:col-span-2">
                      <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shipping Address</p>
                      <p className={`font-medium ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{order.shippingAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors`}>
              <h3 className={`text-lg font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={item.productId?._id || index} className={`flex items-center justify-between p-4 ${effectiveDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.productId?.name || "Unknown Product"}</h4>
                      <p className={`${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                        ${(item.productId?.price || item.price || 0).toFixed(2)} × {item.quantity || 0}
                      </p>
                      {item.productId?.description && (
                        <p className={`${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mt-1`}>{item.productId.description}</p>
                      )}
                      {item.productId?.category && (
                        <span className={`inline-block ${effectiveDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'} text-xs px-2 py-1 rounded-full mt-2`}>
                          {item.productId.category}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        ${((item.productId?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className={`${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>No items found in this order</p>
                )}
              </div>

              {/* Order Summary */}
              <div className={`border-t ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-200'} mt-6 pt-4`}>
                <div className="space-y-2">
                  <div className={`flex justify-between ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Subtotal:</span>
                    <span>${calculateOrderTotal().toFixed(2)}</span>
                  </div>
                  {order.shippingCost && (
                    <div className={`flex justify-between ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span>Shipping:</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className={`flex justify-between ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span>Tax:</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between items-center pt-2 border-t ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <span className={`text-lg font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Amount:</span>
                    <span className={`text-2xl font-bold ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ${(calculateOrderTotal() + (order.shippingCost || 0) + (order.tax || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Order Information Sidebar */}
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors`}>
              <h3 className={`text-lg font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Order Status</h3>
              
              <div className="text-center">
                <div className={`inline-flex px-6 py-3 rounded-full text-lg font-semibold border-2 ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus || "Pending"}
                </div>
                <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3`}>
                  Last updated: {formatDate(order.updatedAt || order.createdAt)}
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            <div className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors`}>
              <h3 className={`text-lg font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 ${effectiveDarkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mt-1`}></div>
                  <div>
                    <p className={`text-sm font-medium ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Order Placed</p>
                    <p className={`text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.orderStatus !== 'pending' && (
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 ${effectiveDarkMode ? 'bg-green-400' : 'bg-green-500'} rounded-full mt-1`}></div>
                    <div>
                      <p className={`text-sm font-medium ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Status: {order.orderStatus}</p>
                      <p className={`text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Status</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Actions */}
            <div className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors`}>
              <h3 className={`text-lg font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/dashboard/order/recent/${order._id}/edit`)}
                  className={`w-full ${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg transition-colors text-sm`}
                >
                  Edit Order
                </button>
                <button
                  onClick={() => window.print()}
                  className={`w-full ${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg transition-colors text-sm`}
                >
                  Print Order
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order._id).then(() => {
                      const successMessage = document.createElement('div');
                      successMessage.className = `fixed top-4 right-4 ${effectiveDarkMode ? 'bg-green-600' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg z-50`;
                      successMessage.textContent = 'Order ID copied!';
                      document.body.appendChild(successMessage);
                      setTimeout(() => document.body.removeChild(successMessage), 2000);
                    });
                  }}
                  className={`w-full ${effectiveDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg transition-colors text-sm`}
                >
                  Copy Order ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEditPage;