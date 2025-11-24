'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../../lib/axios'; 
import { Loader, AlertCircle, ArrowLeft, Lock, ShieldX, CheckCircle, Package } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

const CheckoutPage = () => {
  const { darkMode } = useTheme();
  const [category, setCategory] = useState('');
  const [router, setRouter] = useState({ push: (path) => (window.location.href = path) });

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Define unallowed roles - these roles cannot access this page
  const UNALLOWED_ROLES = ['stationary-vendor', 'canteen-vendor'];

  useEffect(() => {
    // Parse the URL to determine the category
    const pathSegments = window.location.pathname.split('/');
    const checkoutIndex = pathSegments.indexOf('checkout');
    
    if (checkoutIndex > -1 && pathSegments.length > checkoutIndex + 1) {
      const categoryFromPath = pathSegments[checkoutIndex + 1];
      if (categoryFromPath) {
        setCategory(categoryFromPath);
      } else {
        setError("Category is missing from the URL.");
        setLoading(false);
      }
    } else {
      setError("Invalid URL format. Could not determine category.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!category) return;

    const checkAuthAndLoadCheckout = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to proceed with checkout.");
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
          setError("Access denied. Vendors cannot access customer checkout pages.");
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setUserId(user._id);
        setUserRole(user.role);

        // Only fetch cart after authentication is successful
        await fetchCart();

      } catch (err) {
        console.error("Error during authentication check:", err);
        setError("Authentication check failed. Please login again.");
        setLoading(false);
      }
    };

    checkAuthAndLoadCheckout();
  }, [category]);

  const fetchCart = async () => {
    setLoading(true);
    setError(''); 
    try {
      console.log(`Fetching cart for category: ${category}`);
      const response = await axios.get(`/cart/${category}`);
      
      if (response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
        setCart(response.data);
      } else {
        setError('Your cart is empty. Cannot proceed to checkout.');
        setCart(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Your cart is empty. Cannot proceed to checkout.');
      } else {
        setError(err.response?.data?.error || 'Failed to load cart data.');
      }
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, tax: 0, delivery: 0, total: 0 };
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );
    const tax = subtotal * 0.05;
    const delivery = 15.0;
    const total = subtotal + tax + delivery;
    return { subtotal, tax, delivery, total };
  }, [cart]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const response = await axios.post(`/order/from-cart/${category}`);
      const newOrder = response.data;

      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { category } }));
      router.push(`/orders/${newOrder._id}`);
    } catch (err) {
      alert(`Error placing order: ${err.response?.data?.error || 'An unexpected error occurred.'}`);
      setIsPlacingOrder(false);
    }
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
              {accessDenied ? "Checking permissions..." : "Loading checkout..."}
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
              Checkout Access Denied
            </h2>
            <p className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              This checkout page is restricted from:
            </p>
            <ul className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <li>• Canteen Vendors</li>
              <li>• Stationary Vendors</li>
            </ul>
            <p className={`text-xs mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              This is a customer-only page for placing orders and payments.
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
            {error || 'Your cart is empty.'}
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
            <a
              href={`/cart/${category || ''}`}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Return to Cart
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!cart) return null;

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
        

        <a
          href={`/cart/${category}`}
          className={`flex items-center gap-2 text-sm mb-6 transition-colors ${
            darkMode ? "text-gray-300 hover:text-indigo-400" : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          <ArrowLeft size={16} />
          Back to Cart
        </a>

        <div className="text-center mb-8">
          <div className="relative group mx-auto mb-4 inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className={`${
              darkMode
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white/50 border-gray-200/50"
            } backdrop-blur-md rounded-lg border p-6 shadow-md transition-all duration-300`}>
              <h2 className={`text-xl font-semibold mb-4 border-b pb-3 ${
                darkMode ? "text-white border-gray-700" : "text-gray-900 border-gray-200"
              }`}>
                Order Summary
              </h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.productId.imgUrl || 'https://placehold.co/100x100/e2e8f0/e2e8f0'}
                        alt={item.productId.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {item.productId.name}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Vendor Information */}
              {cart.vendorId && (
                <div className={`mt-6 p-4 rounded-lg ${
                  darkMode ? "bg-gray-700/30" : "bg-gray-50/50"
                }`}>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Vendor:
                  </p>
                  <p className="font-semibold text-indigo-600">
                    {cart.vendorId.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`${
              darkMode
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white/50 border-gray-200/50"
            } backdrop-blur-md rounded-lg border p-6 shadow-md sticky top-24 transition-all duration-300`}>
              <h2 className={`text-xl font-semibold mb-4 border-b pb-3 ${
                darkMode ? "text-white border-gray-700" : "text-gray-900 border-gray-200"
              }`}>
                Payment Details
              </h2>
              <div className={`space-y-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5%)</span>
                  <span>₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{totals.delivery.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between text-lg font-bold border-t pt-3 mt-3 ${
                  darkMode ? "border-gray-700 text-white" : "border-gray-200 text-gray-900"
                }`}>
                  <span>Total Payable</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg hover:shadow-green-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader className="animate-spin" size={20} /> Placing Order...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Confirm & Place Order
                  </>
                )}
              </button>
              
              <p className={`text-xs text-center mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                🔒 Secure checkout • Pay on delivery
              </p>
              
              {/* Customer info display */}
              <div className={`mt-4 p-3 rounded text-xs ${
                darkMode ? "bg-gray-700/30" : "bg-gray-50/50"
              }`}>
                <p className={`font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Order placed by:
                </p>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Role: {userRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;