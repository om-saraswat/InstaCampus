"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Grid3x3,
  List,
  Star,
  Plus,
  Minus,
  Package,
  Coffee,
  Store,
  ChevronRight,
  ChevronLeft,
  Heart,
  ShoppingCart,
  Book,
  Filter,
  SortAsc,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import Header from "./Header";

// Enhanced product data with more realistic variety
const sampleProducts = {
  stationary: [
    {
      id: 1,
      name: "Premium Notebook Set",
      price: 299,
      originalPrice: 349,
      image:
        "https://images.unsplash.com/photo-1544716278-e513176f20a5?w=400&h=400&fit=crop",
      description:
        "High-quality ruled notebooks perfect for taking notes and assignments",
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      category: "Notebooks",
      tags: ["premium", "ruled", "study"],
    },
    {
      id: 2,
      name: "Gel Pen Pack (Blue/Black)",
      price: 150,
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop",
      description: "Smooth writing gel pens for comfortable writing experience",
      rating: 4.3,
      reviewCount: 89,
      inStock: true,
      category: "Pens",
      tags: ["gel", "smooth", "writing"],
    },
    {
      id: 3,
      name: "Scientific Calculator",
      price: 899,
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop",
      description:
        "Advanced scientific calculator for mathematics and engineering students",
      rating: 4.8,
      reviewCount: 245,
      inStock: true,
      category: "Electronics",
      tags: ["scientific", "calculator", "engineering"],
    },
    {
      id: 4,
      name: "Art Supply Kit",
      price: 1299,
      originalPrice: 1599,
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
      description: "Complete art kit with colors, brushes, and drawing tools",
      rating: 4.6,
      reviewCount: 67,
      inStock: false,
      category: "Art",
      tags: ["art", "creative", "drawing"],
    },
    {
      id: 13,
      name: "Mechanical Pencil Set",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop",
      description: "Professional mechanical pencils with extra leads",
      rating: 4.4,
      reviewCount: 156,
      inStock: true,
      category: "Pencils",
      tags: ["mechanical", "professional", "precise"],
    },
  ],
  canteen: [
    {
      id: 5,
      name: "Masala Chai",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop",
      description: "Fresh aromatic masala tea with traditional spices",
      rating: 4.7,
      reviewCount: 892,
      inStock: true,
      category: "Beverages",
      tags: ["tea", "spiced", "hot"],
    },
    {
      id: 6,
      name: "Veg Sandwich",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=400&fit=crop",
      description: "Fresh vegetable sandwich with mint chutney",
      rating: 4.4,
      reviewCount: 234,
      inStock: true,
      category: "Snacks",
      tags: ["vegetarian", "fresh", "healthy"],
    },
    {
      id: 7,
      name: "Samosa (2 pieces)",
      price: 25,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop",
      description: "Crispy golden samosas with spiced potato filling",
      rating: 4.5,
      reviewCount: 567,
      inStock: true,
      category: "Snacks",
      tags: ["crispy", "spiced", "traditional"],
    },
    {
      id: 8,
      name: "Cold Coffee",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
      description: "Refreshing iced coffee with whipped cream",
      rating: 4.2,
      reviewCount: 178,
      inStock: true,
      category: "Beverages",
      tags: ["cold", "coffee", "refreshing"],
    },
    {
      id: 14,
      name: "Paneer Roll",
      price: 55,
      image:
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop",
      description: "Grilled paneer roll with fresh vegetables",
      rating: 4.6,
      reviewCount: 298,
      inStock: true,
      category: "Main Course",
      tags: ["paneer", "grilled", "filling"],
    },
  ],
  general: [
    {
      id: 9,
      name: "Hand Sanitizer (100ml)",
      price: 85,
      image:
        "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&h=400&fit=crop",
      description: "70% alcohol-based hand sanitizer for hygiene",
      rating: 4.3,
      reviewCount: 445,
      inStock: true,
      category: "Health",
      tags: ["sanitizer", "hygiene", "alcohol-based"],
    },
    {
      id: 10,
      name: "Face Masks (Pack of 10)",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=400&fit=crop",
      description: "Disposable 3-layer protective face masks",
      rating: 4.1,
      reviewCount: 234,
      inStock: true,
      category: "Health",
      tags: ["masks", "protection", "disposable"],
    },
    {
      id: 11,
      name: "Phone Charger Cable",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
      description: "Universal USB charging cable for smartphones",
      rating: 4.4,
      reviewCount: 189,
      inStock: true,
      category: "Electronics",
      tags: ["charger", "universal", "durable"],
    },
    {
      id: 12,
      name: "Umbrella",
      price: 450,
      image:
        "https://images.unsplash.com/photo-1511919478780-b3eee7b5f953?w=400&h=400&fit=crop",
      description: "Compact foldable umbrella for rainy days",
      rating: 4.0,
      reviewCount: 78,
      inStock: false,
      category: "Accessories",
      tags: ["umbrella", "foldable", "compact"],
    },
    {
      id: 15,
      name: "Power Bank 10000mAh",
      price: 899,
      originalPrice: 1199,
      image:
        "https://images.unsplash.com/photo-1609592413067-5d1084b2a278?w=400&h=400&fit=crop",
      description: "Fast charging power bank with dual USB ports",
      rating: 4.5,
      reviewCount: 312,
      inStock: true,
      category: "Electronics",
      tags: ["power bank", "fast charging", "portable"],
    },
  ],
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

const sortOptions = [
  { id: "featured", name: "Featured", field: "rating", order: "desc" },
  { id: "price-low", name: "Price: Low to High", field: "price", order: "asc" },
  {
    id: "price-high",
    name: "Price: High to Low",
    field: "price",
    order: "desc",
  },
  { id: "rating", name: "Highest Rated", field: "rating", order: "desc" },
  { id: "newest", name: "Newest First", field: "id", order: "desc" },
];

export default function StudentDashboard() {
  const { darkMode } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("stationary");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  useEffect(() => {
    setMounted(true);
    // Load cart and wishlist from localStorage with error handling
    const savedCart = localStorage.getItem("campus-cart");
    const savedWishlist = localStorage.getItem("campus-wishlist");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) || {});
      } catch (e) {
        console.error("Error loading cart:", e);
        setCart({});
      }
    }

    if (savedWishlist) {
      try {
        setWishlist(new Set(JSON.parse(savedWishlist) || []));
      } catch (e) {
        console.error("Error loading wishlist:", e);
        setWishlist(new Set());
      }
    }
  }, []);

  // Save cart and wishlist to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("campus-cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("campus-wishlist", JSON.stringify([...wishlist]));
    }
  }, [wishlist, mounted]);

  const currentProducts = useMemo(
    () => sampleProducts[activeCategory] || [],
    [activeCategory]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = currentProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(product.category);

      return matchesSearch && matchesPrice && matchesCategory;
    });

    // Sort products
    const sortOption = sortOptions.find((option) => option.id === sortBy);
    if (sortOption) {
      filtered.sort((a, b) => {
        const aVal = a[sortOption.field];
        const bVal = b[sortOption.field];

        if (sortOption.order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [currentProducts, searchTerm, priceRange, selectedCategories, sortBy]);

  const addToCart = useCallback((productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  }, []);

  const getTotalCartItems = useCallback(() => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  }, [cart]);

  const getTotalCartValue = useCallback(() => {
    return Object.entries(cart).reduce((total, [productId, count]) => {
      const product = Object.values(sampleProducts)
        .flat()
        .find((p) => p.id === parseInt(productId));
      return total + (product ? product.price * count : 0);
    }, 0);
  }, [cart]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 2000]);
    setSelectedCategories(new Set());
    setSortBy("featured");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="pt-16 flex animate-pulse">
          <div className="w-64 h-screen bg-gray-200 dark:bg-gray-800"></div>
          <div className="flex-1 p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      <Header />

      <div className="flex">
        {/* Enhanced Sidebar */}
        <aside
          className={`${sidebarCollapsed ? "w-16" : "w-80"} ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-r transition-all duration-300 ease-in-out flex flex-col h-auto sticky top-16 z-30 overflow-y-auto`}
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
                  onClick={() => setActiveCategory(category.id)}
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

          {/* Enhanced Stats */}
          {!sidebarCollapsed && (
            <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`p-4 rounded-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-gray-700 to-gray-600"
                    : "bg-gradient-to-r from-gray-50 to-gray-100"
                } border ${darkMode ? "border-gray-600" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Shopping Cart
                  </span>
                  <ShoppingCart className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {getTotalCartItems()} items
                  </span>
                  <span className={`text-lg font-semibold text-green-600`}>
                    ₹{getTotalCartValue()}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-red-900/20 to-pink-900/20"
                    : "bg-gradient-to-r from-red-50 to-pink-50"
                } border ${darkMode ? "border-red-800" : "border-red-200"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Wishlist
                  </span>
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <span
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {wishlist.size} items
                </span>
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
                  Categories
                </label>
                {Object.values(sampleProducts)
                  .flat()
                  .reduce((acc, product) => {
                    if (!acc.includes(product.category))
                      acc.push(product.category);
                    return acc;
                  }, [])
                  .map((category) => (
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
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 ">
          {/* Enhanced Header */}
          <header
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-b px-6 py-4 sticky top-16 z-20`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {categories.find((c) => c.id === activeCategory)?.name ||
                      "Store"}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {filteredAndSortedProducts.length} products
                    </span>
                    {(searchTerm ||
                      selectedCategories.size > 0 ||
                      priceRange[0] > 0 ||
                      priceRange[1] < 2000) && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear filters</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1 sm:w-80">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search products, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-3 py-2.5 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>

                  {/* View Mode */}
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 transition-colors ${
                        viewMode === "grid"
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                          : darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 transition-colors ${
                        viewMode === "list"
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                          : darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-lg transition-colors ${
                      showFilters
                        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                        : darkMode
                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Products Display */}
          <div className="p-6">
            {filteredAndSortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Package
                  className={`w-20 h-20 mb-4 ${
                    darkMode ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <h3
                  className={`text-2xl font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  No products found
                </h3>
                <p
                  className={`text-center mb-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  We couldn't find any products matching your criteria.
                  <br />
                  Try adjusting your search terms or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "space-y-4"
                }`}
              >
                {filteredAndSortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 ${
                      viewMode === "grid"
                        ? "hover:scale-105"
                        : "flex items-center space-x-4 p-4"
                    } group relative`}
                  >
                    {/* Discount Badge */}
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </div>
                    )}

                    {/* Product Image */}
                    <div
                      className={`relative ${
                        viewMode === "grid"
                          ? "aspect-square"
                          : "w-24 h-24 flex-shrink-0"
                      } overflow-hidden ${
                        viewMode === "grid" ? "" : "rounded-lg"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
                          wishlist.has(product.id)
                            ? "bg-red-500 text-white shadow-lg scale-110"
                            : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110"
                        }`}
                        style={{ zIndex: 20 }}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            wishlist.has(product.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      {/* Stock Status */}
                      {!product.inStock && (
                        <div
                          className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
                          style={{ zIndex: 10 }}
                        >
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Quick View on Hover */}
                      {viewMode === "grid" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            Quick View
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div
                      className={`${viewMode === "grid" ? "p-4" : "flex-1"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-900"
                            } ${
                              viewMode === "grid" ? "text-lg" : "text-base"
                            } leading-tight mb-1 line-clamp-2`}
                          >
                            {product.name}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center space-x-1 mb-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.floor(product.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span
                              className={`text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {product.rating}
                            </span>
                            <span
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              ({product.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        } ${
                          viewMode === "grid" ? "line-clamp-2" : "line-clamp-1"
                        }`}
                      >
                        {product.description}
                      </p>

                      {/* Tags */}
                      {viewMode === "grid" && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-1 rounded-full text-xs ${
                                darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-2xl font-bold ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              ₹{product.price}
                            </span>
                            {product.originalPrice && (
                              <span
                                className={`text-lg line-through ${
                                  darkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {product.category}
                          </span>
                        </div>

                        {/* Enhanced Cart Controls */}
                        <div className="flex items-center space-x-2">
                          {cart[product.id] ? (
                            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                className={`font-semibold min-w-[2rem] text-center ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {cart[product.id]}
                              </span>
                              <button
                                onClick={() => addToCart(product.id)}
                                disabled={!product.inStock}
                                className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product.id)}
                              disabled={!product.inStock}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:scale-105 active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Filter Sidebar */}
        {showFilters && (
          <aside
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-l fixed top-16 bottom-0 w-80 p-4 transition-all duration-300 ease-in-out z-40 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
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
                Categories
              </label>
              {Object.values(sampleProducts)
                .flat()
                .reduce((acc, product) => {
                  if (!acc.includes(product.category))
                    acc.push(product.category);
                  return acc;
                }, [])
                .map((category) => (
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
          </aside>
        )}
      </div>
    </div>
  );
}
