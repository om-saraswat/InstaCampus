"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

const OrderEditPage = () => {
  const { orderid } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderid) return;

    api
      .get(`/orders/${orderid}`)
      .then((res) => setOrder(res.data.order))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderid]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="self-start mb-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Order Details</h1>
      <p className="mb-2">Order ID: {order._id}</p>
      <p className="mb-4">Customer: {order.userId?.name || "Unknown"}</p>
      <p className="mb-2 font-semibold">Status: {order.orderStatus || "Pending"}</p>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        {order.items.map((item) => (
          <div key={item.productId._id} className="flex justify-between text-gray-700">
            <span>{item.productId.name} x {item.quantity}</span>
            <span>${(item.productId.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-2 font-medium text-gray-800">
          Total: $
          {order.items
            .reduce((sum, item) => sum + item.productId.price * item.quantity, 0)
            .toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default OrderEditPage;
