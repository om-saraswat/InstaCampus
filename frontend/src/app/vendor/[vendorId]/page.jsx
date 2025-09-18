"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import CartSidebar from "@/app/components/CartSidebar";
import Sidebar from "@/app/components/Sidebar";

export default function VendorProductsPage({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId || params.id;

  // 🔹 category depends on route — adjust this logic if needed
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "stationary";
    

const addToCart = async (productId) => {
  try {
    await axios.post("/cart/add", { productId, quantity: 1 });
    setCartOpen(true); // ✅ open cart after adding

    // 🔔 Dispatch custom event so Sidebar can refresh
    window.dispatchEvent(new CustomEvent("cartUpdated"));

  } catch (err) {
    alert(err.response?.data?.error || "Failed to add to cart");
  }
};

  useEffect(() => {
    async function fetchVendorProducts() {
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
        console.error("❌ Error loading vendor products:", err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (vendorId) {
      fetchVendorProducts();
    } else {
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
    <div className="relative flex">
      {/* ✅ Main Content */}
      <main className="flex-1 p-4">
        {/* 🔹 Top Header Bar */}
        <div
          className={`grid grid-cols-2 w-full ${
            darkMode ? "bg-gray-900" : "bg-gray-200"
          }`}
          style={{ height: "80px" }}
        >
          {/* Left Half - Canteen */}
          <Link
            href="/vendor/canteen-vendor?category=canteen"
            className={`flex items-center justify-center text-2xl font-bold ${
              darkMode
                ? "text-white hover:text-indigo-400"
                : "text-gray-800 hover:text-indigo-600"
            }`}
          >
            Canteen
          </Link>

          {/* Right Half - Stationary */}
          <Link
            href="/vendor/stationary-vendor?category=stationary"
            className={`flex items-center justify-center text-2xl font-bold ${
              darkMode
                ? "text-white hover:text-indigo-400"
                : "text-gray-800 hover:text-indigo-600"
            }`}
          >
            Stationary
          </Link>
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

      {/* ✅ Fixed Sidebar (Cart / Navigation) */}
      <Sidebar cartOpen={cartOpen} setCartOpen={setCartOpen} />
    </div>
  );
}
