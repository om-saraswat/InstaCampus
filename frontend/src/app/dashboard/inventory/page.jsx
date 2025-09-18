"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeProvider";
import api from "@/lib/axios";
import Link from "next/link";

const InventoryPage = () => {
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

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Define allowed roles
  const ALLOWED_ROLES = ['canteen-vendor', 'stationary-vendor'];

  useEffect(() => {
    const checkAuthAndFetchProducts = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to view your inventory.");
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
        console.log("Fetching products for vendor ID:", user._id);

        // Make API call to inventory endpoint
        const response = await api.get(`/inventory`);
        console.log("Full API response:", response);
        console.log("Response data:", response.data);

        // Handle inventory response structure
        let inventoryList = [];
        
        if (response.data && response.data.inventory && Array.isArray(response.data.inventory)) {
          inventoryList = response.data.inventory;
        }

        console.log("Extracted inventory list:", inventoryList);
        console.log("Inventory list length:", inventoryList?.length);

        setProducts(inventoryList);

        if (inventoryList.length === 0) {
          console.log("No products found for this vendor");
        }

      } catch (err) {
        console.error("Error fetching products:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response);
        console.error("Error response data:", err.response?.data);
        
        // Handle specific API errors
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setAccessDenied(true);
          setError("Access forbidden. You don't have permission to view this inventory.");
        } else {
          setError(`Failed to fetch inventory: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProducts();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get stock status color based on quantityAvailable and lowStockThreshold with dark mode support
  const getStockStatusColor = (quantityAvailable, lowStockThreshold = 10) => {
    if (quantityAvailable === 0) {
      return effectiveDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
    } else if (quantityAvailable <= lowStockThreshold) {
      return effectiveDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    } else {
      return effectiveDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    }
  };

  // Get stock status text based on quantityAvailable and lowStockThreshold
  const getStockStatusText = (quantityAvailable, lowStockThreshold = 10) => {
    if (quantityAvailable === 0) {
      return 'Out of Stock';
    } else if (quantityAvailable <= lowStockThreshold) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  // Get category color with dark mode support
  const getCategoryColor = (category) => {
    if (effectiveDarkMode) {
      const darkColors = {
        'electronics': 'bg-blue-900/30 text-blue-400',
        'clothing': 'bg-purple-900/30 text-purple-400',
        'food': 'bg-orange-900/30 text-orange-400',
        'books': 'bg-indigo-900/30 text-indigo-400',
        'home': 'bg-teal-900/30 text-teal-400',
        'sports': 'bg-green-900/30 text-green-400',
        'beauty': 'bg-pink-900/30 text-pink-400',
        'toys': 'bg-yellow-900/30 text-yellow-400',
      };
      return darkColors[category?.toLowerCase()] || 'bg-gray-700 text-gray-300';
    } else {
      const lightColors = {
        'electronics': 'bg-blue-100 text-blue-800',
        'clothing': 'bg-purple-100 text-purple-800',
        'food': 'bg-orange-100 text-orange-800',
        'books': 'bg-indigo-100 text-indigo-800',
        'home': 'bg-teal-100 text-teal-800',
        'sports': 'bg-green-100 text-green-800',
        'beauty': 'bg-pink-100 text-pink-800',
        'toys': 'bg-yellow-100 text-yellow-800',
      };
      return lightColors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }
  };

  // Get stock text color with dark mode support
  const getStockTextColor = (quantity, lowStockThreshold = 10) => {
    if (effectiveDarkMode) {
      if (quantity === 0) return 'text-red-400';
      if (quantity <= lowStockThreshold) return 'text-yellow-400';
      return 'text-green-400';
    } else {
      if (quantity === 0) return 'text-red-600';
      if (quantity <= lowStockThreshold) return 'text-yellow-600';
      return 'text-green-600';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${effectiveDarkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading inventory...</p>
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
            <h1 className={`text-3xl font-bold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Inventory Management</h1>
            <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}>Manage your products and track inventory levels</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Link href="/dashboard/product/add-product">
              <button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className={`${effectiveDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors cursor-pointer`}>
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        <div className={`${effectiveDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
          <h3 className={`text-sm font-semibold ${effectiveDarkMode ? 'text-yellow-200' : 'text-yellow-800'} mb-2`}>Debug Info:</h3>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Vendor ID: {vendorId}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Products Count: {products.length}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Products Type: {Array.isArray(products) ? 'Array' : typeof products}</p>
          <p className={`text-xs ${effectiveDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Dark Mode: {effectiveDarkMode ? 'Enabled' : 'Disabled'}</p>
        </div>

        {/* Inventory Grid */}
        {products.length === 0 ? (
          <div className={`text-center ${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-12 transition-colors`}>
            <div className="mb-6">
              <svg className={`w-16 h-16 ${effectiveDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>No Products Found</h3>
            <p className={`${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>You don't have any products in your inventory yet. Add products to start managing your inventory.</p>
            <Link href="/dashboard/product/add-product">
              <button className={`${effectiveDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-2xl shadow-lg transition-colors`}>
                Add Your First Product
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((inventoryItem) => {
              const product = inventoryItem.productId;
              const quantity = inventoryItem.quantityAvailable;
              const lowStockThreshold = product?.lowStockThreshold || 10;
              
              return (
                <Link
                  key={inventoryItem._id}
                  href={`/dashboard/inventory/${inventoryItem._id}`}
                  className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700 hover:shadow-gray-900/50' : 'bg-white hover:shadow-2xl'} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Product Image */}
                  <div className={`relative h-48 ${effectiveDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    {product?.imgUrl ? (
                      <img
                        src={product.imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg className={`w-12 h-12 ${effectiveDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(quantity, lowStockThreshold)}`}>
                        {getStockStatusText(quantity, lowStockThreshold)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Product Header */}
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg line-clamp-2`}>
                          {product?.name || 'Unknown Product'}
                        </h3>
                      </div>
                      
                      {/* Category */}
                      {product?.category && (
                        <div className="mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                            {product.category}
                          </span>
                        </div>
                      )}
                      
                      <p className={`text-sm ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Product ID: {product?._id?.slice(-8) || 'N/A'}
                      </p>
                    </div>

                    {/* Product Description */}
                    {product?.description && (
                      <div className="mb-4">
                        <p className={`text-sm ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Price and Stock Info */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Price:</span>
                        <span className={`font-bold text-lg ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          ₹{(product?.price || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Stock:</span>
                        <span className={`font-semibold ${getStockTextColor(quantity, lowStockThreshold)}`}>
                          {quantity} units
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low Stock Alert:</span>
                        <span className={`text-sm ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {lowStockThreshold} units
                        </span>
                      </div>
                      
                      {inventoryItem.lastRestockedAT && (
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last Restocked:</span>
                          <span className={`text-sm ${effectiveDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {formatDate(inventoryItem.lastRestockedAT)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className={`border-t ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-3 mb-4`}>
                      <div className={`flex justify-between text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Added: {formatDate(product?.createdAt)}</span>
                        {product?.updatedAt && (
                          <span>Updated: {formatDate(product.updatedAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Action indicator */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${effectiveDarkMode ? 'text-blue-400' : 'text-blue-600'} text-sm`}>
                        <span>Update Inventory</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      
                      {/* Stock indicator */}
                      <div className={`text-xs ${effectiveDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ID: {inventoryItem._id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;