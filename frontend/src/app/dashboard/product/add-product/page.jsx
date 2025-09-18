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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="self-start mb-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl flex flex-col gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="p-3 border rounded"
        />
        <input
          type="text"
          name="category"
          placeholder="Category (canteen/stationary)"
          value={formData.category}
          onChange={handleChange}
          required
          className="p-3 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          className="p-3 border rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          className="p-3 border rounded"
        />
        <input
          type="text"
          name="imgUrl"
          placeholder="Image URL"
          value={formData.imgUrl}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <input
          type="number"
          name="lowStockThreshold"
          placeholder="Low Stock Threshold"
          value={formData.lowStockThreshold}
          onChange={handleChange}
          className="p-3 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
