"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

const VendorOrderDetailPage = () => {
  const { orderid } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  console.log(params)
useEffect(() => {
  if (!orderid) return;
 console.log(orderid);
  api
    .get(`/order/${orderid}`)
    .then((res) => {
      console.log("API response:", res.data); // log here
      setOrder(res.data);
      setStatus(res.data.orderStatus || "pending");
    })
    .catch((err) => {
      console.error("API error:", err.response?.data || err.message);
    })
    .finally(() => setLoading(false));
}, [orderid]);

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      await api.patch(`/vendor/order/${status}/${orderid}`); // update order status for vendor
      alert("Order status updated successfully!");
      router.back();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update order status.");
    }
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!order) return <p className="text-center mt-6">Order not found.</p>;

  // Only show items belonging to this vendor
  const vendorCategory = order.items[0]?.productId.category; // assuming all items are same vendor
  const vendorItems = order.items.filter(item => item.productId.category === vendorCategory);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <button
        onClick={() => router.back()}
        className="self-start mb-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Order Details</h1>
      <p className="mb-2">Order ID: {order._id}</p>
      <p className="mb-4">Customer: {order.userId?.name || "Unknown"}</p>

      <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-2xl mb-4">
        {vendorItems.map((item) => (
          <div key={item.productId._id} className="flex justify-between mb-2">
            <div>
              <p className="font-semibold">{item.productId.name}</p>
              <p className="text-gray-500 text-sm">
                ${item.productId.price} x {item.quantity}
              </p>
            </div>
            <p className="font-medium">
              ${(item.productId.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        <hr className="my-2" />
        <p className="font-bold text-right">
          Total: $
          {vendorItems
            .reduce((sum, item) => sum + item.productId.price * item.quantity, 0)
            .toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-2xl">
        <label className="font-semibold">Order Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={handleStatusUpdate}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors mt-2"
        >
          Update Status
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default VendorOrderDetailPage;
