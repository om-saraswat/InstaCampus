import React from 'react'
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeProvider';
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
    ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Book,
  Coffee,
  Store,
  X,
} from "lucide-react";

function Sidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode } = useTheme();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  
  // Cart data for each category
  const [cartData, setCartData] = useState({
    stationary: { items: 0, value: 0, vendor: null },
    canteen: { items: 0, value: 0, vendor: null }
  });

  // Detect current page and set active category
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      
      if (pathname.includes('canteen-vendor')) {
        setActiveCategory('canteen');
      } else if (pathname.includes('stationary-vendor')) {
        setActiveCategory('stationary');
      } else if (pathname.includes('general-vendor')) {
        setActiveCategory('general');
      }
      // You can add more conditions for specific vendor product pages
      else if (pathname.includes('/vendor/') && pathname.split('/').length > 3) {
        // This is likely a specific vendor's product page
        // You might want to detect category from the products or vendor data
        // For now, keep the last active category
      }
    }
  }, []);

  // Navigation function for category switching
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    
    // Navigate to the appropriate vendor listing page
    switch(categoryId) {
      case 'stationary':
        router.push('/vendor/stationary-vendor');
        break;
      case 'canteen':
        router.push('/vendor/canteen-vendor');
        break;
      case 'general':
        // If you have a general store vendor page, add route here
        router.push('/vendor/general-vendor');
        break;
      default:
        break;
    }
  };
  const getCartData = async (category) => {
    try {
      const response = await axios.get(`/cart/${category}`);
      
      if (response.data && response.data.items) {
        const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = response.data.items.reduce((sum, item) => 
          sum + (item.productId.price * item.quantity), 0
        );
        
        return {
          items: totalItems,
          value: totalValue,
          vendor: response.data.vendorId?.name || null
        };
      }
      return { items: 0, value: 0, vendor: null };
    } catch (error) {
      // Cart not found or empty is normal - don't log as error
      if (error.response?.status === 404) {
        return { items: 0, value: 0, vendor: null };
      }
      console.error(`Error fetching ${category} cart:`, error);
      return { items: 0, value: 0, vendor: null };
    }
  };

  // Load cart data for both categories
  const loadCartData = async () => {
    try {
      const [stationaryCart, canteenCart] = await Promise.all([
        getCartData('stationary'),
        getCartData('canteen')
      ]);
      
      setCartData({
        stationary: stationaryCart,
        canteen: canteenCart
      });
    } catch (error) {
      console.error('Error loading cart data:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadCartData();
  }, []);

  // Listen for cart updates from other components
useEffect(() => {
  const handleCartUpdateCategory = (event) => {
    const { category } = event.detail;
    if (category) {
      getCartData(category).then(data => {
        setCartData(prev => ({
          ...prev,
          [category]: data
        }));
      });
    } else {
      loadCartData();
    }
  };

  window.addEventListener('cartUpdated', handleCartUpdateCategory);

  return () => {
    window.removeEventListener('cartUpdated', handleCartUpdateCategory);
  };
}, []);


  // Auto-refresh cart data every 30 seconds (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      loadCartData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to clear cart for a specific category
  const clearCart = async (category) => {
    try {
      const response = await axios.post(`/cart/clear/${category}`);
      
      if (response.status === 200) {
        setCartData(prev => ({
          ...prev,
          [category]: { items: 0, value: 0, vendor: null }
        }));
        
        alert(`${category} cart cleared successfully!`);
      }
    } catch (error) {
      console.error(`Error clearing ${category} cart:`, error);
      alert(`Error clearing cart: ${error.response?.data?.error || error.message}`);
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedCategories(new Set());
  };

  const categories = [
    {
      id: "stationary",
      name: "Stationary",
      icon: Book,
      color: "from-blue-500 to-blue-600",
      description: "Books, pens, and study materials",
    },
    {
      id: "canteen",
      name: "Canteen",
      icon: Coffee,
      color: "from-orange-500 to-orange-600",
      description: "Fresh food and beverages",
    },
    {
      id: "general",
      name: "General Store",
      icon: Store,
      color: "from-green-500 to-green-600",
      description: "Daily essentials and accessories",
    },
  ];

  return (
    <aside
          className={`${sidebarCollapsed ? "w-16" : "w-80"} ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-r transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0 z-30 overflow-y-auto`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {!sidebarCollapsed && (
              <div>
                <h2
                  className={`font-bold text-lg ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Campus Store
                </h2>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Everything you need on campus
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3
              className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                sidebarCollapsed ? "text-center" : ""
              } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {sidebarCollapsed ? "•••" : "Categories"}
            </h3>

            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group mb-2 ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                      : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title={sidebarCollapsed ? category.name : ""}
                >
                  <Icon
                    className={`w-5 h-5 ${sidebarCollapsed ? "mx-auto" : ""}`}
                  />
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.name}</div>
                      <div
                        className={`text-xs ${
                          isActive ? "text-white/80" : "text-gray-400"
                        }`}
                      >
                        {category.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cart Stats for Each Category */}
          {!sidebarCollapsed && (
            <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Shopping Carts
                </h3>
                <button
                  onClick={loadCartData}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Refresh cart data"
                >
                  🔄
                </button>
              </div>
              
              {/* Stationary Cart */}
              <div
                className={`p-3 rounded-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-900/20 to-blue-800/20"
                    : "bg-gradient-to-r from-blue-50 to-blue-100"
                } border ${darkMode ? "border-blue-800" : "border-blue-200"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Stationary Cart
                  </span>
                  <div className="flex items-center space-x-1">
                    <Book className="w-4 h-4 text-blue-500" />
                    {cartData.stationary.items > 0 && (
                      <button
                        onClick={() => clearCart('stationary')}
                        className={`p-1 rounded-full ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                            : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        }`}
                        title="Clear cart"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-lg font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {cartData.stationary.items} items
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ₹{cartData.stationary.value}
                  </span>
                </div>
                {cartData.stationary.vendor && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Vendor: {cartData.stationary.vendor}
                  </div>
                )}
              </div>

              {/* Canteen Cart */}
              <div
                className={`p-3 rounded-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-orange-900/20 to-orange-800/20"
                    : "bg-gradient-to-r from-orange-50 to-orange-100"
                } border ${darkMode ? "border-orange-800" : "border-orange-200"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Canteen Cart
                  </span>
                  <div className="flex items-center space-x-1">
                    <Coffee className="w-4 h-4 text-orange-500" />
                    {cartData.canteen.items > 0 && (
                      <button
                        onClick={() => clearCart('canteen')}
                        className={`p-1 rounded-full ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                            : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        }`}
                        title="Clear cart"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-lg font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {cartData.canteen.items} items
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ₹{cartData.canteen.value}
                  </span>
                </div>
                {cartData.canteen.vendor && (
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Vendor: {cartData.canteen.vendor}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {!sidebarCollapsed && (
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className={`text-xs px-2 py-1 rounded ${
                    darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Clear
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                      className={`w-full px-2 py-1 text-xs rounded border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value) || 2000,
                        ])
                      }
                      className={`w-full px-2 py-1 text-xs rounded border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Category Filters
                </label>
                {["Stationary", "Canteen", "General Store"].map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedCategories);
                        if (e.target.checked) {
                          newSelected.add(category);
                        } else {
                          newSelected.delete(category);
                        }
                        setSelectedCategories(newSelected);
                      }}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cart Restriction Notice */}
              <div className={`mt-6 p-3 rounded-lg ${
                darkMode 
                  ? "bg-yellow-900/20 border border-yellow-800" 
                  : "bg-yellow-50 border border-yellow-200"
              }`}>
                <h4 className={`text-sm font-semibold mb-1 ${
                  darkMode ? "text-yellow-400" : "text-yellow-800"
                }`}>
                  Cart Policy
                </h4>
                <p className={`text-xs ${
                  darkMode ? "text-yellow-300" : "text-yellow-700"
                }`}>
                  Each category (Stationary/Canteen) has a separate cart. You can only add items from one vendor per category at a time.
                </p>
              </div>
            </div>
          )}
        </aside>
  )
}

export default Sidebar