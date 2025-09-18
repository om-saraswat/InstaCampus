"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";

const VendorOrderDetailPage = () => {
  const { orderid } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    // Get vendor information from session
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (user?._id) {
      setVendorId(user._id);
    }

    if (!orderid) return;
    
    console.log("Order ID:", orderid);
    
    api
      .get(`/order/${orderid}`)
      .then((res) => {
        console.log("API response:", res.data);
        setOrder(res.data);
        setStatus(res.data.orderStatus || "pending");
      })
      .catch((err) => {
        console.error("API error:", err.response?.data || err.message);
        setError("Failed to load order details.");
      })
      .finally(() => setLoading(false));
  }, [orderid]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || updating) return;

    setUpdating(true);
    try {
      await api.patch(`/vendor/order/${status}/${orderid}`);
      
      // Update local state
      setOrder(prev => ({ ...prev, orderStatus: status }));
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Order status updated successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Filter items for this vendor (assuming all items are same vendor for now)
  const vendorCategory = order.items[0]?.productId?.category;
  const vendorItems = order.items.filter(item => item.productId?.category === vendorCategory);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
            </div>
            <p className="text-gray-600">Manage and update order status</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Link href="/dashboard/order/recent">
              <button className="bg-gray-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-gray-700 transition-colors">
                Recent Orders
              </button>
            </Link>
            <Link href="/dashboard/order">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">
                All Orders
              </button>
            </Link>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-xs text-yellow-700">Order ID: {orderid}</p>
          <p className="text-xs text-yellow-700">Vendor ID: {vendorId}</p>
          <p className="text-xs text-yellow-700">Current Status: {order.orderStatus}</p>
          <p className="text-xs text-yellow-700">Vendor Items: {vendorItems.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Order #{order._id?.slice(-8)}
                  </h2>
                  <p className="text-gray-500">{formatDate(order.createdAt || order.orderDate)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus || "Pending"}
                </span>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.userId?.name || "Unknown Customer"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.userId?.email || "N/A"}</p>
                  </div>
                  {order.userId?.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{order.userId.phone}</p>
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium">{order.shippingAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-4">
                {vendorItems.map((item) => (
                  <div key={item.productId?._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.productId?.name || "Unknown Product"}</h4>
                      <p className="text-gray-600 text-sm">
                        ${(item.productId?.price || 0).toFixed(2)} × {item.quantity || 0}
                      </p>
                      {item.productId?.description && (
                        <p className="text-gray-500 text-xs mt-1">{item.productId.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">
                        ${((item.productId?.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${vendorItems
                      .reduce((sum, item) => sum + ((item.productId?.price || 0) * (item.quantity || 0)), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {vendorItems.length} item{vendorItems.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Status Update Sidebar */}
          <div className="space-y-6">
            {/* Status Update Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={updating}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || status === order.orderStatus}
                  className={`w-full px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    updating || status === order.orderStatus
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  }`}
                >
                  {updating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : status === order.orderStatus ? (
                    'Status Up to Date'
                  ) : (
                    'Update Status'
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Order Placed</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.orderStatus !== 'pending' && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Status: {order.orderStatus}</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailPage;