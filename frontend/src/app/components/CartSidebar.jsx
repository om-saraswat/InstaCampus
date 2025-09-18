"use client";
import React, { useEffect, useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import axios from "@/lib/axios";

export default function CartSidebar({ isOpen, onClose, category, darkMode }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // fetch cart when opened
  useEffect(() => {
    if (isOpen && category) fetchCart();
  }, [isOpen, category]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/cart/${category}`);
      setCart(res.data);
    } catch (err) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post(`/cart/clear/${category}`);
      setCart(null);
    } catch (err) {
      console.error("❌ Error clearing cart:", err.response?.data || err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>

      {/* Sidebar */}
      <aside
        className={`w-96 h-full flex flex-col shadow-xl transition-transform duration-300 ${
          darkMode ? "bg-gray-800 border-l border-gray-700" : "bg-white border-l border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
            <h2 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
              Your Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading cart...</p>
          ) : !cart || cart.items.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.productId._id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                <img
                  src={item.productId.imgUrl || "/default-product.svg"}
                  alt={item.productId.name}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="flex-1">
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {item.productId.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {item.quantity} × ₹{item.productId.price}
                  </p>
                </div>
                <span className="font-semibold text-indigo-600">
                  ₹{item.quantity * item.productId.price}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div
            className={`p-4 border-t flex flex-col gap-2 ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`${darkMode ? "text-gray-300" : "text-gray-600"} font-medium`}>
                Total
              </span>
              <span className="text-xl font-bold text-green-600">
                ₹
                {cart.items.reduce(
                  (sum, item) => sum + item.quantity * item.productId.price,
                  0
                )}
              </span>
            </div>
            <button
              onClick={clearCart}
              className="w-full py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Clear Cart
            </button>
            <button className="w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
