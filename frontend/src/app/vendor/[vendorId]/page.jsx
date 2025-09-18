"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Sidebar from "@/app/components/Sidebar";

export default function VendorProductsPage({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [cartError, setCartError] = useState(null);
  
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorid || params.id || params.vendorId || params.vendor;

  useEffect(() => {
    async function fetchVendorProducts() {
      try {
        console.log("=== DEBUG INFO ===");
        console.log("Full params object:", params);
        console.log("Extracted vendorId:", vendorId);
        console.log("API URL will be:", `/product/vendor/${vendorId}`);
        
        if (!vendorId || vendorId === 'undefined') {
          console.error("❌ No valid vendorId found!");
          setLoading(false);
          return;
        }
        
        // Fetch products and vendor details
        const [productsRes, vendorRes] = await Promise.all([
          axios.get(`/product/vendor/${vendorId}`),
          axios.get(`/user/${vendorId}`).catch(() => null) // Optional vendor fetch
        ]);
        
        console.log("✅ Products API Response:", productsRes.data);
        console.log("✅ Vendor API Response:", vendorRes?.data);
        
        if (productsRes.data && productsRes.data.products) {
          console.log("✅ Found products:", productsRes.data.products.length);
          setProducts(productsRes.data.products);
        } else {
          console.warn("⚠️ No products array found in response");
          setProducts([]);
        }
        
        // Set vendor info - try multiple sources
        if (vendorRes && vendorRes.data) {
          // Got vendor details from direct API call
          setVendor({
            _id: vendorRes.data._id || vendorId,
            name: vendorRes.data.name || vendorRes.data.username || 'Vendor Store'
          });
        } else if (productsRes.data.products.length > 0) {
          
          // Set vendor info from the first product if available
          if (productsRes.data.products.length > 0) {
            const firstProduct = productsRes.data.products[0];
            console.log("First product vendor data:", firstProduct.vendorid);
            
            if (firstProduct.vendorid) {
              // Handle both populated and non-populated vendor references
              if (typeof firstProduct.vendorid === 'object' && firstProduct.vendorid.name) {
                // Vendor is populated
                setVendor({ 
                  _id: firstProduct.vendorid._id,
                  name: firstProduct.vendorid.name
                });
              } else if (typeof firstProduct.vendorid === 'string') {
                // Vendor is just an ID, need to fetch vendor details
                try {
                  const vendorRes = await axios.get(`/user/${firstProduct.vendorid}`);
                  setVendor({
                    _id: firstProduct.vendorid,
                    name: vendorRes.data.name || 'Unknown Vendor'
                  });
                } catch (error) {
                  console.error("Error fetching vendor details:", error);
                  setVendor({ 
                    _id: firstProduct.vendorid,
                    name: 'Unknown Vendor' 
                  });
                }
              }
            } else {
              // Fallback: try to get vendor name from URL parameter or other source
              setVendor({ 
                _id: vendorId,
                name: 'Vendor Store' 
              });
            }
          }
        } else {
          console.warn("⚠️ No products array found in response");
          setProducts([]);
        }
        
      } catch (err) {
        console.error("❌ Error loading vendor products:", err.message);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (vendorId) {
      fetchVendorProducts();
    } else {
      console.error("❌ No vendorId found in params:", params);
      setLoading(false);
    }
  }, [vendorId]);

  // Add to cart functionality
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));
      setCartError(null);

      const response = await axios.post('/cart/add', {
        productId: product._id,
        quantity: quantity
      });

      console.log("✅ Product added to cart:", response.data);
      
      // Show success message (you can replace with a toast notification)
      alert(`${product.name} added to cart successfully!`);
      
      // Refresh sidebar cart data if you have a way to do that
      // You might want to emit an event or use a state management solution
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { category: product.category } 
      }));

    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      
      let errorMessage = "Failed to add item to cart";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCartError(errorMessage);
      
      // Show error message (you can replace with a toast notification)
      alert(`Error: ${errorMessage}`);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleBackToVendors = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-center text-gray-500 mt-4">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar/>
      <main className={`flex-1 p-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Cart Error Alert */}
          {cartError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{cartError}</span>
                <button 
                  onClick={() => setCartError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackToVendors}
              className={`mb-6 flex items-center px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Vendors
            </button>
            
            <h1 className={`text-4xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Vendor Products
            </h1>
            {vendor ? (
              <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Products by {vendor.name}
              </p>
            ) : (
              <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Browse our vendor's amazing products
              </p>
            )}
          </div>
          
          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`group relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700 hover:bg-gray-750"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    {product.imgUrl ? (
                      <img
                        src={product.imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                      style={{ display: product.imgUrl ? 'none' : 'flex' }}
                    >
                      <span className="text-white text-3xl font-bold">
                        {product.name?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
                      ₹{product.price}
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-5">
                    <h4 className={`text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {product.name}
                    </h4>
                    
                    <p className="text-sm text-indigo-600 capitalize mb-2 font-medium">
                      {product.category}
                    </p>
                    
                    {product.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}
                    
                    {/* Quantity selector and Add to Cart */}
                    <div className="flex items-center space-x-2 mb-3">
                      <label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Qty:
                      </label>
                      <select 
                        className={`px-2 py-1 rounded border text-sm ${
                          darkMode 
                            ? "bg-gray-700 border-gray-600 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                        id={`quantity-${product._id}`}
                        defaultValue={1}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center group ${
                        addingToCart[product._id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                      onClick={() => {
                        const quantity = parseInt(document.getElementById(`quantity-${product._id}`).value);
                        handleAddToCart(product, quantity);
                      }}
                      disabled={addingToCart[product._id]}
                    >
                      {addingToCart[product._id] ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          Add to Cart
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5M7 13l-1.5-4.5m0 0h15M16 19a2 2 0 100 4 2 2 0 000-4zm-7 0a2 2 0 100 4 2 2 0 000-4z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 opacity-50">📦</div>
              <h3 className={`text-2xl font-semibold mb-3 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                No products available
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                This vendor hasn't added any products yet. Please check back later for amazing products!
              </p>
              <button
                onClick={handleBackToVendors}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Other Vendors
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}