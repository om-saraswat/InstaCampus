"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function VendorProductsPage({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId || params.id; // Handle different param names

  useEffect(() => {
    async function fetchVendorProducts() {
      try {
        console.log("=== DEBUG INFO ===");
        console.log("Full params object:", params);
        console.log("Extracted vendorId:", vendorId);
        console.log("API URL will be:", `/product/vendor/${vendorId}`);
        
        if (!vendorId || vendorId === 'undefined') {
          console.error("❌ No valid vendorId found!");
          setLoading(false);
          return;
        }
        
        // Updated to match your working API endpoint
        const productsRes = await axios.get(`/product/vendor/${vendorId}`);
        console.log("✅ API Response Status:", productsRes.status);
        console.log("✅ API Response Data:", productsRes.data);
        
        // Based on your Postbot response, the structure is { products: [...] }
        if (productsRes.data && productsRes.data.products) {
          console.log("✅ Found products:", productsRes.data.products.length);
          setProducts(productsRes.data.products);
        } else {
          console.warn("⚠️ No products array found in response");
          console.log("Response structure:", Object.keys(productsRes.data));
          setProducts([]);
        }
        
      } catch (err) {
        console.error("❌ Error loading vendor products:", err.message);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (vendorId) {
      fetchVendorProducts();
    } else {
      console.error("❌ No vendorId found in params:", params);
      setLoading(false);
    }
  }, [vendorId]);

  const handleBackToVendors = () => {
    router.back();
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">Loading products...</p>
    );
  }

  return (
    <main className="flex-1 p-4">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBackToVendors}
          className={`mb-4 px-4 py-2 rounded-lg transition-colors ${
            darkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ← Back to Vendors
        </button>
        
        <h1
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Vendor Products
        </h1>
        {vendor && (
          <p className="text-gray-500 mt-1">Products by {vendor.name}</p>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className={`border rounded-lg p-3 transition-all hover:shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <img
                src={product.imgUrl}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png"; // Add a placeholder image
                }}
              />
              <h4
                className={`mt-2 font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {product.name}
              </h4>
              <p className="text-sm text-gray-500">{product.category}</p>
              <p className="text-indigo-600 font-bold">₹{product.price}</p>
              
              {product.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <button
                className="mt-2 w-full bg-indigo-600 text-white py-1 px-3 rounded text-sm hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  // Add to cart or view product details logic here
                  console.log("Add to cart:", product._id);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            This vendor hasn't added any products yet
          </p>
        </div>
      )}
    </main>
  );
}