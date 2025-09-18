// vendor/page.jsx
import React from "react";
import Link from "next/link";

export default function VendorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-10 to-blue- flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 w-full max-w-6xl">
        {/* Product Box */}
        <Link href="/dashboard/product" className="block">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <h2 className="text-2xl font-bold mb-2 text-white">Product</h2>
            <p className="text-white text-sm text-center">
              Manage products & categories
            </p>
          </div>
        </Link>

        {/* Order Box */}
        <Link href="/dashboard/order" className="block">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <h2 className="text-2xl font-bold mb-2 text-white">Order</h2>
            <p className="text-white text-sm text-center">
              View and process orders
            </p>
          </div>
        </Link>

        {/* Inventory Box */}
        <Link href="/dashboard/inventory" className="block">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <h2 className="text-2xl font-bold mb-2 text-white">Inventory</h2>
            <p className="text-white text-sm text-center">
              Track stock and restocks
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
