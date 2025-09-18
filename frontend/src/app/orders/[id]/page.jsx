'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../../lib/axios'; // Corrected path for the custom axios instance
import { Loader, AlertCircle, ArrowLeft, XCircle, ShoppingBag, ShieldX } from 'lucide-react';

const OrderDetailsPage = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Define unallowed roles - ONLY these specific vendor roles are blocked
  const UNALLOWED_ROLES = ['stationary-vendor', 'canteen-vendor'];

  useEffect(() => {
    // Get order ID from the URL path
    const pathSegments = window.location.pathname.split('/');
    const idFromPath = pathSegments[pathSegments.length - 1];
    if (idFromPath) {
      setOrderId(idFromPath);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndLoadOrder = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        console.log("SessionStorage keys:", Object.keys(sessionStorage));
        
        if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
          console.log("No user found in session storage");
          setError("Please login to view order details.");
          setLoading(false);
          return;
        }

        let user;
        try {
          user = JSON.parse(storedUser);
          console.log("Parsed user:", user);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        // Check if user exists and has required fields
        if (!user || !user._id) {
          console.log("No user ID found in session storage, user data:", user);
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        console.log("User found with ID:", user._id, "and role:", user.role);

        // Role-based access control - block ONLY vendor roles, allow all others
        if (user.role && UNALLOWED_ROLES.includes(user.role)) {
          console.log("User role blocked:", user.role);
          console.log("Blocked roles:", UNALLOWED_ROLES);
          setAccessDenied(true);
          setError("Access denied. Vendors cannot access customer order details.");
          setLoading(false);
          return;
        }

        // Allow all other roles (customers, admins, etc.)
        console.log("User role allowed:", user.role || "no role specified");

        console.log("User authorized with role:", user.role || "customer/default");
        setUserId(user._id);
        setUserRole(user.role || "customer");

        // Fetch order regardless of role (as long as not blocked vendor)
        if (orderId) {
          console.log("Proceeding to fetch order for authorized user with order ID:", orderId);
          await fetchOrder();
        } else {
          console.log("No order ID available yet, waiting...");
          setLoading(false);
        }

      } catch (err) {
        console.error("Error during authentication check:", err);
        setError("Authentication check failed. Please login again.");
        setLoading(false);
      }
    };

    if (orderId) {
      checkAuthAndLoadOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/order/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch order details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    setIsCancelling(true);
    try {
      const response = await axios.patch(`/order/cancel/${orderId}`);
      setOrder(response.data.order); // Update state with the cancelled order
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || 'Could not cancel the order.'}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const totals = useMemo(() => {
    if (!order?.items) return { subtotal: 0, tax: 0, delivery: 0, total: 0 };
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const delivery = 15.00; // Flat delivery fee
    const total = subtotal + tax + delivery;
    return { subtotal, tax, delivery, total };
  }, [order]);
  
  const canBeCancelled = order && !['completed', 'shipped', 'delivered', 'cancelled'].includes(order.orderStatus);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {accessDenied ? "Checking permissions..." : "Loading order details..."}
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center rounded-2xl shadow-lg p-8 max-w-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
          <div className="mb-4">
            <ShieldX className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Order Details Access Denied</h2>
          <p className="mb-2 text-gray-600 dark:text-gray-300">
            This order details page is restricted from:
          </p>
          <ul className="text-sm mb-6 text-gray-500 dark:text-gray-400">
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <p className="text-xs mb-6 text-gray-500 dark:text-gray-400">
            This is a customer-only page for viewing personal order details.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/vendor-dashboard" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Go to Vendor Dashboard
            </a>
            <a href="/dashboard" className="px-6 py-2 rounded-lg transition-colors bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500 dark:text-red-400" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{error}</h2>
        {error.includes("login") ? (
          <div className="flex flex-col gap-3 mt-4">
            <a
              href="/login"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            <a href="/orders" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              Back to All Orders
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Order not found state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Debug Info (remove in production) */}
          <div className="mb-6 p-4 rounded-lg border bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200">
            <h3 className="text-sm font-semibold mb-2">✅ Customer Order Details Access Granted:</h3>
            <p className="text-xs">User Role: {userRole || "customer/default"}</p>
            <p className="text-xs">User ID: {userId}</p>
            <p className="text-xs">Order ID: {orderId}</p>
            <p className="text-xs">Order Found: No</p>
            <p className="text-xs">Access Type: Authorized user order details viewing</p>
            <p className="text-xs">Blocked Roles: {UNALLOWED_ROLES.join(', ')}</p>
          </div>

          <div className="flex flex-col justify-center items-center h-96 text-center p-4">
            <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">Order not found.</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">The order you're looking for doesn't exist or has been removed.</p>
            <a href="/orders" className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              Back to All Orders
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Debug Info (remove in production) */}
        <div className="mb-6 p-4 rounded-lg border bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200">
          <h3 className="text-sm font-semibold mb-2">✅ Customer Order Details Access Granted:</h3>
          <p className="text-xs">User Role: {userRole || "customer/default"}</p>
          <p className="text-xs">User ID: {userId}</p>
          <p className="text-xs">Order ID: {orderId}</p>
          <p className="text-xs">Order Found: Yes</p>
          <p className="text-xs">Access Type: Authorized user order details viewing</p>
          <p className="text-xs">Blocked Roles: {UNALLOWED_ROLES.join(', ')}</p>
        </div>

        <a href="/orders" className="flex items-center gap-2 text-sm hover:text-indigo-500 transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to All Orders
        </a>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 border-b pb-4 dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">ID: {order._id}</p>
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0">
                <p className="font-semibold">Status: <span className="font-normal">{order.orderStatus}</span></p>
                <p className="font-semibold">Date: <span className="font-normal">{new Date(order.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Items</h2>
            {order.items.map((item, index) => {
              // ✅ FIX: Check if productId exists before trying to access its properties.
              const product = item.productId; 
              return (
                <div key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center gap-4">
                    <img
                      src={product ? product.imgUrl : 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=N/A'}
                      alt={product ? product.name : 'Product not available'}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-medium">{product ? product.name : 'Product not available'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Price: ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h2 className="text-xl font-semibold mb-2">User Details</h2>
                <p><strong>Name:</strong> {order.userId.name}</p>
                <p><strong>Email:</strong> {order.userId.email}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Order Total</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Taxes (5%)</span><span>₹{totals.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee</span><span>₹{totals.delivery.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3 dark:border-gray-600">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
            </div>
          </div>
          
          {canBeCancelled && (
            <div className="mt-6 border-t pt-6 dark:border-gray-700">
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <><Loader className="animate-spin" size={20} /> Cancelling...</>
                ) : (
                  <><XCircle size={18} /> Cancel Order</>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;