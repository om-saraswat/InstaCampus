"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "../context/ThemeProvider";
import Header from "./Header";
import Sidebar from "./Sidebar";

import DashboardHeader from "./DashboardHeader";
import FilterSidebar from "./FilterSidebar";
import ProductsGrid from "./ProductsGrid";
import { sampleProducts, sortOptions } from "../data/sampleProducts";



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

        <Sidebar
          darkMode={darkMode}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          cart={cart}
          wishlist={wishlist}
          getTotalCartItems={getTotalCartItems}
          getTotalCartValue={getTotalCartValue}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          clearFilters={clearFilters}
        />

        {/* Main Content */}
        <main className="flex-1">
          <DashboardHeader
            darkMode={darkMode}
            activeCategory={activeCategory}
            filteredAndSortedProducts={filteredAndSortedProducts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategories={selectedCategories}
            priceRange={priceRange}
            clearFilters={clearFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {/* Products Display */}
          <div className="p-6">
            <ProductsGrid
              darkMode={darkMode}
              viewMode={viewMode}
              filteredAndSortedProducts={filteredAndSortedProducts}
              clearFilters={clearFilters}
              cart={cart}
              wishlist={wishlist}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              toggleWishlist={toggleWishlist}
            />
          </div>
        </main>

        <FilterSidebar
          darkMode={darkMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
      </div>
    </div>
  );
}
