"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeProvider";
import api from "@/lib/axios";

const AddProductPage = () => {
  const router = useRouter();
  const { darkMode } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
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
  
  const [localStorageTheme, setLocalStorageTheme] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'true' || theme === '"true"';
      setLocalStorageTheme(isDark);
    }
  }, [mounted]);
  
  const effectiveDarkMode = darkMode ?? localStorageTheme;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    lowStockThreshold: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError("");
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create FormData to send multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("lowStockThreshold", formData.lowStockThreshold);
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await api.post("/product", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      router.push("/dashboard/product");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${effectiveDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-200'} flex flex-col items-center p-6 transition-colors`}>
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

        {/* Image Upload Area */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Product Image
          </label>
          
          {!imagePreview ? (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? effectiveDarkMode
                    ? 'border-blue-400 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : effectiveDarkMode
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="imageInput"
              />
              <label htmlFor="imageInput" className="cursor-pointer">
                <div className={`text-5xl mb-2 ${effectiveDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  📸
                </div>
                <p className={`text-sm mb-1 ${effectiveDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Drag & drop an image here, or click to select
                </p>
                <p className={`text-xs ${effectiveDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Maximum file size: 5MB
                </p>
              </label>
            </div>
          ) : (
            <div className={`relative rounded-lg overflow-hidden border ${effectiveDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

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
      </form>
    </div>
  );
};

export default AddProductPage;