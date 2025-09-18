"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios"; // adjust path to your Axios instance

const RecentOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent orders
    api
      .get("/vendor/recent/orders")
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => console.error("Error fetching recent orders:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-6">Loading recent orders...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 w-full max-w-5xl">Recent Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600 w-full max-w-5xl">No recent orders found.</p>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col hover:shadow-2xl transition-shadow"
            >
              <p className="font-semibold">Order ID: {order._id}</p>
              <p className="text-gray-600">
                Customer: {order.userId?.name || "Unknown"}
              </p>
              <p className="text-gray-600 mb-2">
                Total: $
                {order.items
                  .reduce(
                    (sum, item) => sum + item.productId.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </p>
              <div className="flex flex-col gap-1 mb-2">
                {order.items.map((item) => (
                  <p key={item.productId._id} className="text-gray-500 text-sm">
                    {item.productId.name} x {item.quantity} (${item.productId.price})
                  </p>
                ))}
              </div>
              <p className="text-gray-500 text-sm">
                Status: {order.orderStatus || "Pending"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrderPage;
