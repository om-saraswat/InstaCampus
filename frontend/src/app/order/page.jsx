'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useTheme } from '../context/ThemeProvider';
import { Loader, AlertCircle, ArrowLeft, Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const CheckoutPage = () => {
  const { category } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  useEffect(() => {
    const fetchCart = async () => {
      if (!category) return;
      try {
        const response = await axios.get(`/cart/${category}`);
        if (response.data.items.length === 0) {
          setError('Your cart is empty. Cannot proceed to checkout.');
          setCart(null);
        } else {
          setCart(response.data);
        }
      } catch (err) {
        setError('Failed to load cart for checkout. Please try again.');
        console.error("Fetch cart error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [category]);

  const totals = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.productId.price * item.quantity), 0
    );
    const tax = subtotal * 0.05; // 5% tax
    const delivery = 15.00; // Flat delivery fee
    const total = subtotal + tax + delivery;
    return { subtotal, tax, delivery, total };
  }, [cart]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const response = await axios.post(`/orders/from-cart/${category}`);
      const newOrder = response.data;
      
      // Dispatch event to update sidebar cart status
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { category } }));

      // Redirect to the new order's confirmation page
      router.push(`/orders/${newOrder._id}`);

    } catch (err) {
      alert(`Error placing order: ${err.response?.data?.error || 'An unexpected error occurred.'}`);
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="w-12 h-12 animate-spin text-indigo-500" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <AlertCircle className={`w-16 h-16 mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
        <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{error}</h2>
        <Link href={`/cart/${category}`} className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <Link href={`/cart/${category}`} className="flex items-center gap-2 text-sm hover:text-indigo-500 transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-3">
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">Order Summary</h2>
              <div className="space-y-4">
                {cart.items.map(item => (
                  <div key={item.productId._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img src={item.productId.imgUrl || '/placeholder.png'} alt={item.productId.name} className="w-12 h-12 object-cover rounded-md" />
                      <div>
                        <p className="font-medium">{item.productId.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{(item.productId.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-lg shadow-md sticky top-24 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:border-gray-700">Payment Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxes (5%)</span><span>₹{totals.tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span>₹{totals.delivery.toFixed(2)}</span></div>
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
              <p className="text-xs text-center mt-3 text-gray-500">You will be asked to pay on delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;