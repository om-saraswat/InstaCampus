"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function VendorPage({ darkMode }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[2]; // "stationary-vendor"

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
      'book-vendor': {
        title: '📖 Book Vendors',
        description: 'Textbooks and reference materials',
        gradient: 'from-green-500 to-teal-600',
        icon: '📖',
        buttonText: 'Browse Books',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        emptyIcon: '📚',
        emptyText: 'No book vendors found'
      },
      'electronics-vendor': {
        title: '💻 Electronics Vendors',
        description: 'Laptops, gadgets, and tech accessories',
        gradient: 'from-purple-500 to-pink-600',
        icon: '💻',
        buttonText: 'View Electronics',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        emptyIcon: '💻',
        emptyText: 'No electronics vendors found'
      }
    };
    return configs[role] || configs['stationary-vendor'];
  };

  const config = getRoleConfig(role);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await axios.get(`/user/vendor/${role}`);
        console.log("API response:", res.data);
        setVendors(res.data.filteruser || []);
      } catch (err) {
        console.error("Error loading vendors:", err);
      } finally {
        setLoading(false);
      }
    }

    if (role) fetchVendors();
  }, [role]);

  const handleVendorClick = (vendorId) => {
    console.log("Navigating to vendor:", vendorId);
    router.push(`/vendor/${vendorId}`);
  };

  const handleBackToCategories = () => {
    router.push('/vendor');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-center text-gray-500 mt-4">Loading vendors...</p>
      </div>
    );
  }

  return (
    <main className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleBackToCategories}
            className={`mb-6 flex items-center px-4 py-2 rounded-lg transition-colors ${
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
          
          <h1 className={`text-4xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            {config.title}
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
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
                  <h4 className={`text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {vendor.name}
                  </h4>
                  
                  <p className="text-sm text-gray-500 capitalize mb-1 font-medium">
                    {vendor.role?.replace('-', ' ')}
                  </p>
                  
                  {vendor.email && (
                    <p className="text-sm text-gray-400 truncate mb-3 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {vendor.email}
                    </p>
                  )}
                  
                  {/* Additional vendor info */}
                  {vendor.location && (
                    <p className="text-xs text-gray-500 mb-3 flex items-center">
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
            <h3 className={`text-2xl font-semibold mb-3 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              {config.emptyText}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We're working on adding more vendors to this category. Check back soon for exciting options!
            </p>
            <button
              onClick={handleBackToCategories}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Explore Other Categories
            </button>
          </div>
        )}
      </div>
    </main>
  );
}