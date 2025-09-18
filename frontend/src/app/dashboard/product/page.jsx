"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/axios"; // your Axios instance

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get user from sessionStorage
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        const user = storedUser ? JSON.parse(storedUser) : null;
        console.log("Parsed user:", user);

        if (!user?._id) {
          console.log("No user ID found in session storage");
          setError("Please login to view your products.");
          setLoading(false);
          return;
        }

        setVendorId(user._id);
        console.log("Fetching products for vendor ID:", user._id);

        // Make API call
        const response = await api.get(`/product/vendor/${user._id}`);
        console.log("Full API response:", response);
        console.log("Response data:", response.data);
        console.log("Response status:", response.status);

        // Handle different possible response structures
        let productList = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            // If response.data is directly an array
            productList = response.data;
          } else if (response.data.products) {
            // If products are in response.data.products
            productList = response.data.products;
          } else if (response.data.data) {
            // If products are in response.data.data
            productList = response.data.data;
          } else if (response.data.result) {
            // If products are in response.data.result
            productList = response.data.result;
          }
        }

        console.log("Extracted product list:", productList);
        console.log("Product list type:", typeof productList);
        console.log("Is product list an array?", Array.isArray(productList));
        console.log("Product list length:", productList?.length);

        // Ensure we have an array
        const finalProducts = Array.isArray(productList) ? productList : [];
        console.log("Final products to set:", finalProducts);

        setProducts(finalProducts);
        
        if (finalProducts.length === 0) {
          console.log("No products found for this vendor");
        }

      } catch (err) {
        console.error("Error fetching products:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response);
        console.error("Error response data:", err.response?.data);
        console.error("Error response status:", err.response?.status);
        
        setError(`Failed to fetch products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // No vendor ID state
  if (!vendorId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <p className="text-gray-600 mb-4">Please login to view your products.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
          <Link href="/dashboard/product/add-product">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </Link>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-xs text-yellow-700">Vendor ID: {vendorId}</p>
          <p className="text-xs text-yellow-700">Products Count: {products.length}</p>
          <p className="text-xs text-yellow-700">Products Type: {Array.isArray(products) ? 'Array' : typeof products}</p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <div className="mb-6">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">You haven't added any products yet. Start by adding your first product!</p>
            <Link href="/dashboard/product/add-product">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">
                Add Your First Product
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/dashboard/product/${product._id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                  {product.imgUrl ? (
                    <img
                      src={product.imgUrl}
                      alt={product.name || 'Product'}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.name || 'Unnamed Product'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.category || 'Uncategorized'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-blue-600">
                      ${product.price || '0.00'}
                    </p>
                    {product.stock !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;