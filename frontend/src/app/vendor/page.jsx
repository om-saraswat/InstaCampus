"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function VendorPage({ darkMode }) {
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [vendorId, setVendorId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Define allowed roles
  const ALLOWED_ROLES = ['students','student','Student'];

  useEffect(() => {
    const checkAuthAndLoadPage = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);
        
        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to access the vendor hub.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        console.log("Parsed user:", user);

        // Check if user exists and has required fields
        if (!user?._id) {
          console.log("No vendor ID found in session storage");
          setError("Invalid user session. Please login again.");
          setLoading(false);
          return;
        }

        // Role-based access control
        if (!user.role || !ALLOWED_ROLES.includes(user.role)) {
          console.log("User role not authorized:", user.role);
          console.log("Allowed roles:", ALLOWED_ROLES);
          setAccessDenied(true);
          setError("Access denied. This page is only accessible to canteen and stationary vendors.");
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setVendorId(user._id);
        setUserRole(user.role);

      } catch (err) {
        console.error("Error during authentication check:", err);
        setError("Authentication check failed. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadPage();
  }, []);

  const handleImageError = (categoryName) => {
    setImageErrors(prev => ({
      ...prev,
      [categoryName]: true
    }));
  };

  const vendorCategories = [
    { 
      name: "Canteen Vendors", 
      path: "/vendor/canteen-vendor", 
      img: "/canteen.jpg",
      description: "Delicious food from campus canteens",
      icon: "🍽️"
    },
    { 
      name: "Stationary Vendors", 
      path: "/vendor/stationary-vendor", 
      img: "/stationary.jpg",
      description: "All your academic supplies in one place",
      icon: "📚"
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Loading vendor hub...
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            This page is restricted to:
          </p>
          <ul className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Login with Vendor Account
            </Link>
            <Link href="/dashboard" className={`px-6 py-2 rounded-lg transition-colors ${
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {error}
          </p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Debug Info (remove in production) */}
      <div className={`w-full max-w-6xl mb-6 p-4 rounded-lg border ${
        darkMode 
          ? "bg-yellow-900 border-yellow-700 text-yellow-200" 
          : "bg-yellow-50 border-yellow-200 text-yellow-700"
      }`}>
        <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
        <p className="text-xs">Vendor ID: {vendorId}</p>
        <p className="text-xs">User Role: {userRole}</p>
        <p className="text-xs">Access Level: Authorized Vendor</p>
      </div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🏪 Vendor Hub</h1>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Discover amazing vendors across different categories
        </p>
        <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Welcome, {userRole === 'canteen-vendor' ? 'Canteen' : 'Stationary'} Vendor!
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        {vendorCategories.map((category) => (
          <Link
            key={category.name}
            href={category.path}
            className={`group relative rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}
          >
            {/* Image Background */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={category.img}
                alt={category.name}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback to gradient background if image fails
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gradient-to-br', 'from-indigo-500', 'to-purple-600');
                  handleImageError(category.name);
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {category.name}
                </h2>
                <p className="text-sm text-center opacity-90 group-hover:opacity-100 transition-opacity">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Bottom Section */}
            <div className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Explore Vendors
                </span>
                <div className="text-indigo-500 group-hover:text-indigo-600 transition-colors">
                  <svg 
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <p className={`text-lg mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Can't find what you're looking for?
        </p>
        <button 
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          onClick={() => {
            // Add logic to request new vendor category or contact admin
            alert("Feature coming soon! Contact admin to request new vendor categories.");
          }}
        >
          Request New Category
        </button>
      </div>
    </div>
  );
}