'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from '@/lib/axios';
import { useTheme } from '../../context/ThemeProvider';
import { Loader, Trash2, ShoppingBag, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const CartPage = () => {
  // Get category from URL
  const pathSegments = window.location.pathname.split('/');
  const category = pathSegments[pathSegments.indexOf('cart') + 1] || '';
  const router = {
    back: () => window.history.back(),
  };
  
  const { darkMode } = useTheme();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Define unallowed roles - these roles cannot access this page
  const UNALLOWED_ROLES = ['stationary-vendor', 'canteen-vendor'];

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to view your cart.");
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
          setError("Access denied. Vendors cannot access customer cart pages.");
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

    checkAuthAndLoadCart();
  }, [category]);

  const fetchCart = async () => {
    if (!category) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/cart/${category}`);
      setCart(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Your cart is empty. Let's get shopping!");
        setCart(null);
      } else {
        setError('Failed to load cart. Please try again.');
        console.error("Fetch cart error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const dispatchCartUpdate = () => {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { category } }));
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await axios.put('/cart/update-item', {
        productId,
        quantity: newQuantity,
        category,
      });
      setCart(response.data);
      dispatchCartUpdate();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || 'Could not update quantity'}`);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      const response = await axios.delete('/cart/remove-item', {
        data: { productId, category },
      });
      if (response.data.items.length === 0) {
        setCart(null);
        setError("Your cart is empty. Let's get shopping!");
      } else {
        setCart(response.data);
      }
      dispatchCartUpdate();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || 'Could not remove item'}`);
    }
  };

  const handleClearCart = async () => {
    if (!confirm(`Are you sure you want to clear the entire ${categoryName} cart?`)) return;
    try {
      await axios.post(`/cart/clear/${category}`);
      setCart(null);
      setError("Your cart is empty. Let's get shopping!");
      dispatchCartUpdate();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || 'Could not clear cart'}`);
    }
  };
  
  const totals = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.productId.price * item.quantity), 0
    );
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            {accessDenied ? "Checking permissions..." : "Loading your cart..."}
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <ShoppingBag className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            This cart page is restricted from:
          </p>
          <ul className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <p className={`text-xs mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            This is a customer-only page for managing shopping carts.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/vendor-dashboard" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Go to Vendor Dashboard
            </a>
            <a href="/dashboard" className={`px-6 py-2 rounded-lg transition-colors ${
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
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
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <AlertCircle className={`w-16 h-16 mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
        <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{error}</h2>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {error.includes("login") ? "Please login to continue" : "Looks like there's nothing here."}
        </p>
        {error.includes("login") ? (
          <div className="flex flex-col gap-3">
            <a href="/login" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              Go to Login
            </a>
            <button
              onClick={() => window.location.reload()}
              className={`px-6 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Try Again
            </button>
          </div>
        ) : (
          <a href={`/vendor/${category}-vendor`} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            Shop {categoryName} Items
          </a>
        )}
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-4xl mx-auto">
        

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-center">{categoryName} Shopping Cart</h1>
          <button onClick={fetchCart} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Refresh Cart">
            <RefreshCw size={20} />
          </button>
        </div>

        {cart.vendorId && (
          <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Items from:</p>
            <h3 className="text-xl font-semibold text-indigo-500">{cart.vendorId.name}</h3>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             {cart.items.map(item => (
                <div key={item.productId._id} className={`flex items-center gap-4 p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <img src={item.productId.imgUrl || '/placeholder.png'} alt={item.productId.name} className="w-20 h-20 object-cover rounded-md" />
                  <div className="flex-grow">
                    <h4 className="font-semibold">{item.productId.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price: ₹{item.productId.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId._id, parseInt(e.target.value))}
                      className={`w-16 text-center border rounded-md p-1 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                    />
                  </div>
                  <div className="text-right font-semibold w-20">
                    ₹{(item.productId.price * item.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => handleRemoveItem(item.productId._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg shadow-sm sticky top-24 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-semibold border-b pb-3 mb-4 dark:border-gray-700">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (5%)</span><span>₹{totals.tax.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3 dark:border-gray-700">
                  <span>Total</span>
                  <span>₹{totals.total.toFixed(2)}</span>
              </div>

              <a href={`/checkout/${category}`} className="block w-full mt-6">
                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all">
                  Proceed to Checkout
                </button>
              </a>
              
              <button onClick={handleClearCart} className="w-full mt-3 text-sm text-red-500 hover:text-red-700 transition-colors">
                Clear Cart
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;