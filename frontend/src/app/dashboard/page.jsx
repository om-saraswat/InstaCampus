// vendor/page.jsx
import React from "react";
import Link from "next/link";

const VendorPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Product Box */}
        <Link href="/dashboard/product" className="block">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Product</h2>
          </div>
        </Link>

        {/* Order Box */}
        <Link href="/dashboard/order" className="block">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Order</h2>
          </div>
        </Link>

        {/* Inventory Box */}
        <Link href="/dashboard/inventory" className="block">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Inventory</h2>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default VendorPage;
