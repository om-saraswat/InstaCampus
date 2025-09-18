"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function EditProductPage({ darkMode }) {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    imgUrl: "",
    lowStockThreshold: 0,
  });

  // Fetch product details on mount
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`/product/${productId}`);
        if (res.data.product) {
          setProduct(res.data.product);
          setForm({
            name: res.data.product.name || "",
            category: res.data.product.category || "",
            description: res.data.product.description || "",
            price: res.data.product.price || 0,
            imgUrl: res.data.product.imgUrl || "",
            lowStockThreshold: res.data.product.lowStockThreshold || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        alert("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }

    if (productId) fetchProduct();
  }, [productId]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await axios.patch(`/product/${productId}`, form);
      alert(res.data.message || "Product updated successfully");
      // Optionally redirect back to vendor page
      router.push("/dashboard/product"); // adjust as needed
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeleting(true);
    try {
      const res = await axios.delete(`/product/${productId}`);
      alert(res.data.message || "Product deleted successfully");
      router.push("/dashboard/product"); // adjust redirect as needed
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading product...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1
        className={`text-2xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Edit Product
      </h1>

      {product && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              <option value="stationary">Stationary</option>
              <option value="canteen">Canteen</option>
              <option value="xeros">Xeros</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Image URL</label>
            <input
              type="text"
              name="imgUrl"
              value={form.imgUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Low Stock Threshold
            </label>
            <input
              type="number"
              name="lowStockThreshold"
              value={form.lowStockThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              min={0}
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
            >
              {updating ? "Updating..." : "Update Product"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
