"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { useParams } from "next/navigation";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get vendor information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        const user = storedUser ? JSON.parse(storedUser) : null;
        console.log("Parsed user:", user);

        if (!user?._id) {
          console.log("No vendor ID found in session storage");
          setError("Please login to view your orders.");
          setLoading(false);
          return;
        }

        setVendorId(user._id);
        console.log("Fetching orders for vendor ID:", user._id);

        // Make API call - you might need to adjust this endpoint
        const response = await api.get(`/vendor/orders`);
        console.log("Full API response:", response);
        console.log("Response data:", response.data);

        // Handle different possible response structures
        let orderList = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            orderList = response.data;
          } else if (response.data.orders) {
            orderList = response.data.orders;
          } else if (response.data.data) {
            orderList = response.data.data;
          }
        }

        console.log("Extracted order list:", orderList);
        console.log("Order list length:", orderList?.length);

        const finalOrders = Array.isArray(orderList) ? orderList : [];
        setOrders(finalOrders);

        if (finalOrders.length === 0) {
          console.log("No orders found for this vendor");
        }

      } catch (err) {
        console.error("Error fetching orders:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response);
        console.error("Error response data:", err.response?.data);
        
        setError(`Failed to fetch orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate order total safely
  const calculateOrderTotal = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    
    return order.items.reduce((sum, item) => {
      const price = item.productId?.price || item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
      case 'out for delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">All Orders</h1>
            <p className="text-gray-600">Manage and track your vendor orders</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Link href="/dashboard/order/recent">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Orders
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className="bg-gray-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-gray-700 transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-xs text-yellow-700">Vendor ID: {vendorId}</p>
          <p className="text-xs text-yellow-700">Orders Count: {orders.length}</p>
          <p className="text-xs text-yellow-700">Orders Type: {Array.isArray(orders) ? 'Array' : typeof orders}</p>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <div className="mb-6">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-6">You don't have any orders yet. Orders will appear here once customers start purchasing your products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/dashboard/order/${order._id}`}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      Order #{order._id?.slice(-8) || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt || order.orderDate)}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <p className="text-gray-700 font-medium">
                    Customer: {order.userId?.name || order.customerName || 'Unknown Customer'}
                  </p>
                  {order.userId?.email && (
                    <p className="text-sm text-gray-500">{order.userId.email}</p>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 flex-1">
                          {item.productId?.name || item.productName || 'Unknown Product'} × {item.quantity || 0}
                        </span>
                        <span className="text-gray-800 font-medium">
                          ${((item.productId?.price || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">No items found</p>
                    )}
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="font-bold text-lg text-blue-600">
                      ${calculateOrderTotal(order).toFixed(2)}
                    </span>
                  </div>
                  
                  {order.items?.length && (
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Action indicator */}
                <div className="mt-4 flex items-center text-blue-600 text-sm">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;