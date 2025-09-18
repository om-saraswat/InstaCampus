"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";

import Sidebar from "@/app/components/Sidebar";

export default function VendorProductsPage({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Define unallowed roles - these roles cannot access this page
  const UNALLOWED_ROLES = ['stationary-vendor', 'canteen-vendor'];

  const filteredProducts = products.filter((product) => {
    const inPriceRange =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    const inCategory =
      selectedCategories.size === 0 || selectedCategories.has(product.category);

    return inPriceRange && inCategory;
  });

  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId || params.id;

  // category depends on route — adjust this logic if needed
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "stationary";

  useEffect(() => {
    const checkAuthAndLoadPage = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to view vendor products.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        console.log("Parsed user:", user);

        // Check if user exists and has required fields
        if (!user?._id) {
          console.log("No user ID found in session storage");
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        // Role-based access control - block vendor roles
        if (user.role && UNALLOWED_ROLES.includes(user.role)) {
          console.log("User role blocked:", user.role);
          console.log("Blocked roles:", UNALLOWED_ROLES);
          setAccessDenied(true);
          setError("Access denied. Vendors cannot access customer shopping pages.");
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setUserId(user._id);
        setUserRole(user.role);

        // Only fetch products after authentication is successful
        await fetchVendorProducts();

      } catch (err) {
        console.error("Error during authentication check:", err);
        setError("Authentication check failed. Please login again.");
        setLoading(false);
      }
    };

    checkAuthAndLoadPage();
  }, [vendorId]);

  const fetchVendorProducts = async () => {
    try {
      if (!vendorId || vendorId === "undefined") {
        setLoading(false);
        return;
      }

      const productsRes = await axios.get(`/product/vendor/${vendorId}`);
      if (productsRes.data?.products) {
        setProducts(productsRes.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error loading vendor products:", err.message);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post("/cart/add", { productId, quantity: 1 });
      setCartOpen(true); // open cart after adding

      // Dispatch custom event so Sidebar can refresh
      window.dispatchEvent(new CustomEvent("cartUpdated"));

    } catch (err) {
      alert(err.response?.data?.error || "Failed to add to cart");
    }
  };

  const handleBackToVendors = () => {
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            {accessDenied ? "Checking permissions..." : "Loading products..."}
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            This shopping page is restricted from:
          </p>
          <ul className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <p className={`text-xs mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            This is a customer-only page for shopping and ordering products.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/vendor-dashboard" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Go to Vendor Dashboard
            </Link>
            <Link href="/dashboard" className={`px-6 py-2 rounded-lg transition-colors ${
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {error}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <Link href="/login" className={`px-6 py-2 rounded-lg transition-colors ${
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex">
      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Debug Info (remove in production) */}
        <div className={`mb-6 p-4 rounded-lg border ${
          darkMode 
            ? "bg-green-900 border-green-700 text-green-200" 
            : "bg-green-50 border-green-200 text-green-700"
        }`}>
          <h3 className="text-sm font-semibold mb-2">✅ Customer Shopping Access Granted:</h3>
          <p className="text-xs">User Role: {userRole}</p>
          <p className="text-xs">User ID: {userId}</p>
          <p className="text-xs">Vendor ID: {vendorId}</p>
          <p className="text-xs">Products Found: {products.length}</p>
          <p className="text-xs">Access Type: Customer shopping for products</p>
        </div>

        {/* Page Content */}
        <div className="mb-6 mt-4">
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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`border rounded-lg p-3 transition-all hover:shadow-lg ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <img
                  src={product.imgUrl || "/default-product.svg"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = "/default-product.svg";
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
                  onClick={() => addToCart(product._id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h3 className={`text-xl font-semibold mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              No Products Available
            </h3>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              This vendor hasn't added any products yet
            </p>
            <button
              onClick={handleBackToVendors}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Other Vendors
            </button>
          </div>
        )}
      </main>

      {/* Fixed Sidebar (Cart / Navigation) */}
      <Sidebar 
        cartOpen={cartOpen} 
        setCartOpen={setCartOpen} 
        priceRange={priceRange} 
        setPriceRange={setPriceRange} 
        selectedCategories={selectedCategories} 
        setSelectedCategories={setSelectedCategories}
      />
    </div>
  );
}