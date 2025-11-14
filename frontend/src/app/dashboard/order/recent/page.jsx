"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../../../context/ThemeProvider";
import api from "@/lib/axios";
import Link from "next/link";

const RecentOrderPage = () => {
  const { darkMode } = useTheme();
  
  // Force component to re-render when localStorage changes
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Listen for theme changes in localStorage
  useEffect(() => {
    const handleThemeChange = () => {
      setMounted(prev => !prev);
    };
    
    window.addEventListener('storage', handleThemeChange);
    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const result = originalSetItem.apply(this, arguments);
      if (key === 'theme') {
        setTimeout(handleThemeChange, 0);
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
  
  const effectiveDarkMode = darkMode ?? localStorageTheme;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Notification state
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [highlightedOrderIds, setHighlightedOrderIds] = useState(new Set());
  const previousOrdersRef = useRef([]);
  const audioIntervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  const ALLOWED_ROLES = ['canteen-vendor', 'stationary-vendor'];
  
  // Notification sound that plays for 1 minute
  const playNotificationSound = () => {
    try {
      // Stop any existing sound
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let playCount = 0;
      const maxPlays = 30; // Play 30 times over 60 seconds (every 2 seconds)
      
      const playBell = () => {
        if (playCount >= maxPlays) {
          clearInterval(audioIntervalRef.current);
          return;
        }
        
        // Create a pleasant notification sound (bell-like)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Bell-like sound frequencies
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Play second tone
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          
          oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator2.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
          
          gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.5);
        }, 200);
        
        playCount++;
      };
      
      // Play immediately
      playBell();
      
      // Then play every 2 seconds for 1 minute
      audioIntervalRef.current = setInterval(playBell, 2000);
      
    } catch (err) {
      console.error("Error playing notification sound:", err);
    }
  };

  // Stop notification sound
  const stopNotificationSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  // Show notification popup
  const showNewOrderNotification = (changedOrders) => {
    setNewOrderNotification(changedOrders[0]); // Show the first changed order
    setShowNotification(true);
    playNotificationSound();
    
    // Highlight all changed orders
    const newHighlightedIds = new Set(changedOrders.map(order => order._id));
    setHighlightedOrderIds(newHighlightedIds);
    
    // Clear existing timeouts
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    // Hide notification popup after 30 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
      setTimeout(() => setNewOrderNotification(null), 300);
    }, 30000);
    
    // Remove highlights after 60 seconds (1 minute)
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedOrderIds(new Set());
    }, 60000);
  };

  // Close notification manually
  const closeNotification = () => {
    setShowNotification(false);
    setTimeout(() => setNewOrderNotification(null), 300);
    stopNotificationSound();
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };

  const fetchRecentOrders = async (isInitialLoad = false) => {
    try {
      const storedUser = sessionStorage.getItem("user");
      
      if (!storedUser) {
        if (isInitialLoad) {
          setError("Please login to view your recent orders.");
          setLoading(false);
        }
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user?._id) {
        if (isInitialLoad) {
          setError("Invalid user session. Please login again.");
          setLoading(false);
        }
        return;
      }

      if (!user.role || !ALLOWED_ROLES.includes(user.role)) {
        if (isInitialLoad) {
          setAccessDenied(true);
          setError("Access denied. This page is only accessible to canteen and stationary vendors.");
          setLoading(false);
        }
        return;
      }

      if (isInitialLoad) {
        setVendorId(user._id);
      }

      const response = await api.get(`/vendor/recent/orders`);

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

      const finalOrders = Array.isArray(orderList) ? orderList : [];
      
      // Check for changes in orders (only after initial load)
      if (!isInitialLoad && previousOrdersRef.current.length > 0) {
        const changedOrders = [];
        
        // Check for new orders
        finalOrders.forEach(newOrder => {
          const existingOrder = previousOrdersRef.current.find(o => o._id === newOrder._id);
          
          if (!existingOrder) {
            // This is a completely new order
            changedOrders.push(newOrder);
          } else if (existingOrder.orderStatus !== newOrder.orderStatus) {
            // Order status changed
            changedOrders.push(newOrder);
          }
        });
        
        // If there are any changes, show notification
        if (changedOrders.length > 0) {
          showNewOrderNotification(changedOrders);
        }
      }
      
      // Update previous orders reference
      previousOrdersRef.current = finalOrders;
      
      setOrders(finalOrders);

    } catch (err) {
      console.error("Error fetching recent orders:", err);
      
      if (isInitialLoad) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setAccessDenied(true);
          setError("Access forbidden. You don't have permission to view these orders.");
        } else {
          setError(`Failed to fetch recent orders: ${err.message}`);
        }
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };
  
  useEffect(() => {
    // Initial load
    fetchRecentOrders(true);

    // Set up polling every 30 seconds (you can adjust this interval)
    const intervalId = setInterval(() => {
      fetchRecentOrders(false);
    }, 60000); // 30 seconds

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const calculateOrderTotal = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    
    return order.items.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

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

  const getStatusColor = (status) => {
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

  const getStatCardColors = (type) => {
    const baseClasses = effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
    
    switch (type) {
      case 'total':
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-blue-400' : 'text-blue-600',
          icon: effectiveDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
        };
      case 'pending':
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-yellow-400' : 'text-yellow-600',
          icon: effectiveDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
        };
      case 'processing':
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-blue-400' : 'text-blue-600',
          icon: effectiveDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
        };
      case 'shipped':
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-purple-400' : 'text-purple-600',
          icon: effectiveDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
        };
      case 'delivered':
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-green-400' : 'text-green-600',
          icon: effectiveDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
        };
      case 'cancelled':
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-red-400' : 'text-red-600',
          icon: effectiveDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
        };
      default:
        return {
          card: baseClasses,
          text: effectiveDarkMode ? 'text-gray-300' : 'text-gray-600',
          icon: effectiveDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${effectiveDarkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading recent orders...</p>
        </div>
      </div>
    );
  }

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
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.01);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      {/* New Order Notification Popup */}
      {newOrderNotification && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${showNotification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className={`${effectiveDarkMode ? 'bg-gray-800 border border-green-500' : 'bg-white border border-green-500'} rounded-lg shadow-2xl p-4 max-w-sm`}>
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="bg-green-500 rounded-full p-2 animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className={`font-semibold ${effectiveDarkMode ? 'text-green-400' : 'text-green-600'} mb-1`}>
                  🎉 New Order Received!
                </h3>
                <p className={`text-sm ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  Order #{newOrderNotification._id?.slice(-8)}
                </p>
                <p className={`text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Customer: {newOrderNotification.userId?.name || 'Unknown'}
                </p>
                <p className={`text-sm font-semibold ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
                  Total: ₹{calculateOrderTotal(newOrderNotification).toFixed(2)}
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeNotification}
                className={`flex-shrink-0 ${effectiveDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
              <Link
                href={`/dashboard/order/recent/${newOrderNotification._id}`}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg transition-colors text-center"
                onClick={closeNotification}
              >
                View Order
              </Link>
              <button
                onClick={closeNotification}
                className={`${effectiveDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-sm px-3 py-2 rounded-lg transition-colors`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Recent Orders</h1>
            <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Your latest orders from the past 30 days • Auto-refreshes every 30 seconds
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Link href="/dashboard/order">
              <button className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors flex items-center gap-2`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                All Orders
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className={`${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors`}>
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className={`${getStatCardColors('total').card} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders</p>
                  <p className={`text-2xl font-bold ${getStatCardColors('total').text}`}>{orders.length}</p>
                </div>
                <div className={`${getStatCardColors('total').icon} p-3 rounded-full`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${getStatCardColors('pending').card} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
                  <p className={`text-2xl font-bold ${getStatCardColors('pending').text}`}>
                    {orders.filter(order => order.orderStatus?.toLowerCase() === 'pending').length}
                  </p>
                </div>
                <div className={`${getStatCardColors('pending').icon} p-3 rounded-full`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${getStatCardColors('processing').card} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processing</p>
                  <p className={`text-2xl font-bold ${getStatCardColors('processing').text}`}>
                    {orders.filter(order => 
                      ['confirmed', 'processing'].includes(order.orderStatus?.toLowerCase())
                    ).length}
                  </p>
                </div>
                <div className={`${getStatCardColors('processing').icon} p-3 rounded-full`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${getStatCardColors('shipped').card} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shipped</p>
                  <p className={`text-2xl font-bold ${getStatCardColors('shipped').text}`}>
                    {orders.filter(order => 
                      ['shipped', 'out for delivery'].includes(order.orderStatus?.toLowerCase())
                    ).length}
                  </p>
                </div>
                <div className={`${getStatCardColors('shipped').icon} p-3 rounded-full`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${getStatCardColors('delivered').card} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Delivered</p>
                  <p className={`text-2xl font-bold ${getStatCardColors('delivered').text}`}>
                    {orders.filter(order => 
                      ['delivered', 'completed'].includes(order.orderStatus?.toLowerCase())
                    ).length}
                  </p>
                </div>
                <div className={`${getStatCardColors('delivered').icon} p-3 rounded-full`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${getStatCardColors('cancelled').card} rounded-2xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</p>
                  <p className={`text-2xl font-bold ${getStatCardColors('cancelled').text}`}>
                    {orders.filter(order => 
                      ['cancelled', 'rejected'].includes(order.orderStatus?.toLowerCase())
                    ).length}
                  </p>
                </div>
                <div className={`${getStatCardColors('cancelled').icon} p-3 rounded-full`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className={`text-center ${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 transition-colors`}>
            <div className="mb-6">
              <svg className={`w-16 h-16 ${effectiveDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>No Recent Orders</h3>
            <p className={`${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>You don't have any recent orders. New orders from the past 30 days will appear here.</p>
            <Link href="/dashboard/order" className={`${effectiveDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}>
              View All Orders
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/dashboard/order/recent/${order._id}`}
                className={`${
                  highlightedOrderIds.has(order._id)
                    ? effectiveDarkMode
                      ? 'bg-gradient-to-r from-green-900/40 to-gray-800 border-2 border-green-500 shadow-green-500/30 animate-pulse-slow'
                      : 'bg-gradient-to-r from-green-50 to-white border-2 border-green-500 shadow-green-500/30 animate-pulse-slow'
                    : effectiveDarkMode
                    ? 'bg-gray-800 border border-gray-700 hover:shadow-gray-900/50'
                    : 'bg-white hover:shadow-2xl'
                } rounded-2xl shadow-lg p-6 transition-all duration-300 transform hover:-translate-y-1 ${
                  highlightedOrderIds.has(order._id)
                    ? effectiveDarkMode
                      ? 'border-l-4 border-l-green-400'
                      : 'border-l-4 border-l-green-500'
                    : effectiveDarkMode
                    ? 'border-l-4 border-l-blue-400'
                    : 'border-l-4 border-l-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg`}>
                        Order #{order._id?.slice(-8) || 'Unknown'}
                      </h3>
                      {highlightedOrderIds.has(order._id) ? (
                        <span className={`${effectiveDarkMode ? 'bg-green-500 text-white' : 'bg-green-500 text-white'} text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 animate-bounce`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          NEW!
                        </span>
                      ) : (
                        <span className={`${effectiveDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'} text-xs px-2 py-1 rounded-full font-medium`}>
                          Recent
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(order.createdAt || order.orderDate)}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                <div className="mb-4">
                  <p className={`${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    Customer: {order.userId?.name || order.customerName || 'Unknown Customer'}
                  </p>
                  {order.userId?.email && (
                    <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.userId.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className={`text-sm font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Items:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={`${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} flex-1`}>
                          {item.productId?.name || item.productName || 'Unknown Product'} × {item.quantity || 0}
                        </span>
                        <span className={`${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                          ₹{((item.productId?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    )) || (
                      <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No items found</p>
                    )}
                  </div>
                </div>

                <div className={`border-t ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-3`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total:</span>
                    <span className={`font-bold text-lg ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ₹{calculateOrderTotal(order).toFixed(2)}
                    </span>
                  </div>
                  
                  {order.items?.length && (
                    <p className={`text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

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

export default RecentOrderPage;