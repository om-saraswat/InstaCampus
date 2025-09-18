'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../../lib/axios'; 
import { Loader, AlertCircle, ArrowLeft, Lock } from 'lucide-react';

const CheckoutPage = () => {
  const [category, setCategory] = useState('');
  const [router, setRouter] = useState({ push: (path) => (window.location.href = path) });

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    // This effect parses the URL to robustly determine the category.
    const pathSegments = window.location.pathname.split('/');
    const checkoutIndex = pathSegments.indexOf('checkout');
    
    // Check if 'checkout' is in the URL and if there's a segment after it.
    if (checkoutIndex > -1 && pathSegments.length > checkoutIndex + 1) {
      const categoryFromPath = pathSegments[checkoutIndex + 1];
      if (categoryFromPath) {
        setCategory(categoryFromPath);
      } else {
        setError("Category is missing from the URL.");
        setLoading(false);
      }
    } else {
      setError("Invalid URL format. Could not determine category.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect only runs if a valid category has been found.
    if (!category) {
      return; 
    }

    const fetchCart = async () => {
      setLoading(true);
      setError(''); 
      try {
        console.log(`Fetching cart for category: ${category}`);
        const response = await axios.get(`/cart/${category}`);
        
        if (response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
          setCart(response.data);
        } else {
          setError('Your cart is empty. Cannot proceed to checkout.');
          setCart(null);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Your cart is empty. Cannot proceed to checkout.');
        } else {
          setError(err.response?.data?.error || 'Failed to load cart data.');
        }
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [category]);

  const totals = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, tax: 0, delivery: 0, total: 0 };
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );
    const tax = subtotal * 0.05;
    const delivery = 15.0;
    const total = subtotal + tax + delivery;
    return { subtotal, tax, delivery, total };
  }, [cart]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const response = await axios.post(`/order/from-cart/${category}`);
      const newOrder = response.data;

      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { category } }));
      router.push(`/orders/${newOrder._id}`);
    } catch (err) {
      alert(`Error placing order: ${err.response?.data?.error || 'An unexpected error occurred.'}`);
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <Loader className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-white dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500 dark:text-red-400" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
          {error || 'Your cart is empty.'}
        </h2>
        <a
          href={`/cart/${category || ''}`}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          Return to Cart
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <a
          href={`/cart/${category}`}
          className="flex items-center gap-2 text-sm hover:text-indigo-500 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </a>
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">
                Order Summary
              </h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.productId.imgUrl || 'https://placehold.co/100x100/e2e8f0/e2e8f0'}
                        alt={item.productId.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-medium">{item.productId.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">₹{(item.productId.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="p-6 rounded-lg shadow-md sticky top-24 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">
                Payment Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5%)</span>
                  <span>₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{totals.delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3 dark:border-gray-700">
                  <span>Total Payable</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader className="animate-spin" size={20} /> Placing Order...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Confirm & Place Order
                  </>
                )}
              </button>
              <p className="text-xs text-center mt-3 text-gray-500">
                You will be asked to pay on delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;