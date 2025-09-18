"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeProvider";
import api from "@/lib/axios"; // adjust path to your Axios instance

const AddProductPage = () => {
  const router = useRouter();
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

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    imgUrl: "",
    lowStockThreshold: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/product", formData); // POST request to your backend
      router.push("/vendor/dashboard/product"); // redirect to product list after success
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-200'} flex flex-col items-center p-6 transition-colors`}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className={`self-start mb-6 ${effectiveDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-4 py-2 rounded-lg transition-colors shadow-sm`}
      >
        ← Back
      </button>

      <h1 className={`text-3xl font-bold mb-6 ${effectiveDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Add New Product</h1>

      {error && (
        <p className={`font-medium mb-4 px-4 py-2 rounded-lg w-full max-w-xl ${effectiveDarkMode ? 'text-red-400 bg-red-900/20 border border-red-700' : 'text-red-600 bg-red-100'}`}>
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className={`${effectiveDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-6 w-full max-w-xl flex flex-col gap-4 transition-colors`}
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            effectiveDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            effectiveDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">-- Select Category --</option>
          <option value="canteen">Canteen</option>
          <option value="stationary">Stationary</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical ${
            effectiveDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            effectiveDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <input
          type="url"
          name="imgUrl"
          placeholder="Image URL"
          value={formData.imgUrl}
          onChange={handleChange}
          className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            effectiveDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <input
          type="number"
          name="lowStockThreshold"
          placeholder="Low Stock Threshold"
          value={formData.lowStockThreshold}
          onChange={handleChange}
          min="0"
          className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            effectiveDarkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <button
          type="submit"
          disabled={loading}
          className={`text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 ${
            effectiveDarkMode 
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700'
          }`}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>

        {/* Debug Info (remove in production) */}
        <div className={`mt-4 p-3 rounded-lg text-xs ${effectiveDarkMode ? 'bg-yellow-900/20 border border-yellow-700 text-yellow-300' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
          <p>Theme Debug: {effectiveDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;