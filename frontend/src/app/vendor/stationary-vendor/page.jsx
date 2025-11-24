"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import { useTheme } from "../../context/ThemeProvider"; // Update this import path

export default function VendorPage() {
  const { darkMode } = useTheme(); // Use the theme context instead of prop
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [vendorId, setVendorId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[2]; // "stationary-vendor"

  // Define unallowed roles - these roles cannot access this page
  const UNALLOWED_ROLES = ['stationary-vendor', 'canteen-vendor'];

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

        // Role-based access control - block vendor roles
        if (user.role && UNALLOWED_ROLES.includes(user.role)) {
          console.log("User role blocked:", user.role);
          console.log("Blocked roles:", UNALLOWED_ROLES);
          setAccessDenied(true);
          setError("Access denied. Vendors cannot access this customer page.");
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setVendorId(user._id);
        setUserRole(user.role);

        // Only fetch vendors after authentication is successful
        if (role) {
          await fetchVendors();
        }

      } catch (err) {
        console.error("Error during authentication check:", err);
        setError("Authentication check failed. Please login again.");
        setLoading(false);
      }
    };

    checkAuthAndLoadPage();
  }, [role]);

  // Separate function to fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await axios.get(`/user/vendor/${role}`);
      console.log("API response:", res.data);
      setVendors(res.data.filteruser || []);
    } catch (err) {
      console.error("Error loading vendors:", err);
      setError("Failed to load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get role-specific styling and content
  const getRoleConfig = (role) => {
    const configs = {
      'canteen-vendor': {
        title: '🍽️ Canteen Vendors',
        description: 'Delicious food from campus canteens',
        gradient: 'from-orange-500 to-red-600',
        icon: '🍕',
        buttonText: 'View Menu',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        emptyIcon: '🍽️',
        emptyText: 'No canteen vendors found'
      },
      'stationary-vendor': {
        title: '📚 Stationary Vendors',
        description: 'All your academic supplies in one place',
        gradient: 'from-blue-500 to-indigo-600',
        icon: '✏️',
        buttonText: 'View Products',
        buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
        emptyIcon: '📚',
        emptyText: 'No stationary vendors found'
      },
      // 'book-vendor': {
      //   title: '📖 Book Vendors',
      //   description: 'Textbooks and reference materials',
      //   gradient: 'from-green-500 to-teal-600',
      //   icon: '📖',
      //   buttonText: 'Browse Books',
      //   buttonColor: 'bg-green-600 hover:bg-green-700',
      //   emptyIcon: '📚',
      //   emptyText: 'No book vendors found'
      // },
      // 'electronics-vendor': {
      //   title: '💻 Electronics Vendors',
      //   description: 'Laptops, gadgets, and tech accessories',
      //   gradient: 'from-purple-500 to-pink-600',
      //   icon: '💻',
      //   buttonText: 'View Electronics',
      //   buttonColor: 'bg-purple-600 hover:bg-purple-700',
      //   emptyIcon: '💻',
      //   emptyText: 'No electronics vendors found'
      // }
    };
    return configs[role] || configs['stationary-vendor'];
  };

  const config = getRoleConfig(role);

  const handleVendorClick = (vendorId) => {
    console.log("Navigating to vendor:", vendorId);
    router.push(`/vendor/${vendorId}`);
  };

  const handleBackToCategories = () => {
    router.push('/vendor');
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className={`transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {accessDenied ? "Checking permissions..." : "Loading vendors..."}
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md transition-colors duration-200 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className={`mb-2 transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            This page is restricted from:
          </p>
          <ul className={`text-sm mb-6 transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <p className={`text-xs mb-6 transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            This is a customer-only page for browsing vendors.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/vendor-dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Go to Vendor Dashboard
            </Link>
            <Link href="/dashboard" className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
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
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className={`text-center rounded-2xl shadow-lg p-8 max-w-md transition-colors duration-200 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}>
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className={`mb-6 transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {error}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
            <Link href="/login" className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen p-6 transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <button
            onClick={handleBackToCategories}
            className={`mb-6 flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          
          <h1 className={`text-4xl font-bold mb-3 transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {config.title}
          </h1>
          <p className={`text-lg transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {config.description}
          </p>
        </div>

        {/* Vendors Grid */}
        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor._id}
                onClick={() => handleVendorClick(vendor._id)}
                className={`group relative rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700 hover:bg-gray-750"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Vendor Avatar/Image with enhanced styling */}
                <div className={`relative h-48 bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-white transform rotate-45 scale-150"></div>
                  </div>
                  
                  {/* Main content */}
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {config.icon}
                    </div>
                    <div className="text-white text-3xl font-bold opacity-90">
                      {vendor.name?.charAt(0)?.toUpperCase() || "V"}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                
                {/* Content Section */}
                <div className="p-5">
                  <h4 className={`text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors duration-200 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {vendor.name}
                  </h4>
                  
                  <p className={`text-sm capitalize mb-1 font-medium transition-colors duration-200 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {vendor.role?.replace('-', ' ')}
                  </p>
                  
                  {vendor.email && (
                    <p className={`text-sm truncate mb-3 flex items-center transition-colors duration-200 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {vendor.email}
                    </p>
                  )}
                  
                  {/* Additional vendor info */}
                  {vendor.location && (
                    <p className={`text-xs mb-3 flex items-center transition-colors duration-200 ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {vendor.location}
                    </p>
                  )}
                  
                  <button
                    className={`w-full ${config.buttonColor} text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center group`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVendorClick(vendor._id);
                    }}
                  >
                    {config.buttonText}
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-50">{config.emptyIcon}</div>
            <h3 className={`text-2xl font-semibold mb-3 transition-colors duration-200 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              {config.emptyText}
            </h3>
            <p className={`mb-8 max-w-md mx-auto transition-colors duration-200 ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}>
              We're working on adding more vendors to this category. Check back soon for exciting options!
            </p>
            <button
              onClick={handleBackToCategories}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Explore Other Categories
            </button>
          </div>
        )}
      </div>
    </main>
  );
}