"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/axios"; // your Axios instance

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?._id) {
      setLoading(false);
      return;
    }

    setVendorId(user._id);

    api
      .get(`/product/vendor/${user._id}`)
      .then((res) => setProducts(res.data.products || []))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (!vendorId) return <p>Please login to view your products.</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <Link href="/vendor/dashboard/product/add-product" className="mb-6">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">
          Add Product
        </button>
      </Link>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/vendor/dashboard/product/${product._id}`}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center hover:shadow-2xl transition-shadow"
            >
              {product.imgUrl && (
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">{product.category}</p>
              <p className="text-gray-700 font-medium">${product.price}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
