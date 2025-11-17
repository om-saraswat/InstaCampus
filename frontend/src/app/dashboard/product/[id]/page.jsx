"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useTheme } from "../../../context/ThemeProvider";

export default function EditProductPage() {
  const { darkMode } = useTheme();
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    lowStockThreshold: 0,
  });

  // ✅ Helper function to create image URL from base64
  const getImageUrl = (product) => {
    if (product?.imageBase64 && product?.imageContentType) {
      return `data:${product.imageContentType};base64,${product.imageBase64}`;
    }
    return null;
  };

  // Fetch product details on mount
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`/product/${productId}`);
        console.log("Product fetched:", res.data);
        
        if (res.data.product) {
          const productData = res.data.product;
          setProduct(productData);
          setForm({
            name: productData.name || "",
            category: productData.category || "",
            description: productData.description || "",
            price: productData.price || 0,
            lowStockThreshold: productData.lowStockThreshold || 0,
          });
          
          // Set initial image preview if product has an image
          const imageUrl = getImageUrl(productData);
          if (imageUrl) {
            setImagePreview(imageUrl);
          }
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

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image selection
  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(getImageUrl(product)); // Reset to original image
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('lowStockThreshold', form.lowStockThreshold);
      
      // Add image if a new one was selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await axios.patch(`/product/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Update response:", res.data);
      alert(res.data.message || "Product updated successfully");
      router.push("/dashboard/product");
    } catch (err) {
      console.error("Update error:", err);
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
      router.push("/dashboard/product");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            darkMode ? 'border-blue-400' : 'border-blue-600'
          } mx-auto mb-4`}></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          Edit Product
        </h1>

        {product && (
          <form onSubmit={handleSubmit} className={`rounded-2xl shadow-lg p-6 space-y-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Image Upload Section */}
            <div>
              <label className={`block mb-2 font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Product Image
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              
              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Select a new image to replace the current one (max 5MB)
              </p>
            </div>

            {/* Name */}
            <div>
              <label className={`block mb-2 font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block mb-2 font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">Select Category</option>
                <option value="stationary">Stationary</option>
                <option value="canteen">Canteen</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className={`block mb-2 font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows={4}
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className={`block mb-2 font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                min={0}
                step="0.01"
                required
              />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className={`block mb-2 font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Low Stock Threshold
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                min={0}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updating}
                className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  updating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : darkMode
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {updating ? "Updating..." : "Update Product"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  deleting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => router.push("/dashboard/product")}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}