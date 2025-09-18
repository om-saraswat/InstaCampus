"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // adjust path to your Axios instance

const AddProductPage = () => {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center p-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="self-start mb-6 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Product</h1>

      {error && (
        <p className="text-red-600 font-medium mb-4 bg-red-100 px-4 py-2 rounded-lg w-full max-w-xl">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl flex flex-col gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="imgUrl"
          placeholder="Image URL"
          value={formData.imgUrl}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          name="lowStockThreshold"
          placeholder="Low Stock Threshold"
          value={formData.lowStockThreshold}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-[1.02] disabled:opacity-70"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
