'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Key, Store, ShoppingBag, Copy, CheckCircle, AlertCircle,
  Loader2, Clock, Trash2, RefreshCw, Shield, LogOut
} from 'lucide-react';
import axios from '@/lib/axios';
import { useTheme } from '../context/ThemeProvider';

export default function AdminGenerateCodePage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [vendorType, setVendorType] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeCodes, setActiveCodes] = useState([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, used: 0, expired: 0 });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      
      try {
        // First, try to verify with backend using the cookie
        const response = await axios.get('/auth/verify');
        console.log('Auth verification response:', response.data);
        
        const user = response.data.user || response.data.data?.user;
        console.log('Verified user from backend:', user);

        if (!user) {
          console.log('No user returned from backend');
          router.push('/login');
          return;
        }

        // Check if user is admin
        if (user.role !== 'admin') {
          console.log('User is not admin, redirecting to dashboard. Role:', user.role);
          router.push('/dashboard');
          return;
        }

        console.log('Authentication successful - Admin user:', user);
        setCurrentUser(user);
        
        // Store in sessionStorage for consistency with other pages
        sessionStorage.setItem('user', JSON.stringify(user));
        
        setIsCheckingAuth(false);
        
      } catch (err) {
        console.error('Auth verification failed:', err);
        
        // Fallback: check sessionStorage/localStorage
        const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
        console.log("Fallback - stored user:", storedUser);

        if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }

        let user;
        try {
          user = JSON.parse(storedUser);
          console.log('Fallback - parsed user:', user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          router.push('/login');
          return;
        }

        // Check if user is admin
        if (!user || user.role !== 'admin') {
          console.log('Fallback - User is not admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }

        console.log('Fallback authentication successful - Admin user:', user);
        setCurrentUser(user);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Load codes and stats after auth check
  useEffect(() => {
    if (!isCheckingAuth && currentUser) {
      loadActiveCodes();
      loadStats();
    }
  }, [isCheckingAuth, currentUser]);

  const loadActiveCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const response = await axios.get('/vendor-code/active');
      setActiveCodes(response.data.data || []);
    } catch (err) {
      console.error('Error loading codes:', err);
      setError(err.response?.data?.error || 'Failed to load codes');
    }
    setIsLoadingCodes(false);
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/vendor-code/stats');
      setStats(response.data.data || { total: 0, active: 0, used: 0, expired: 0 });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleGenerateCode = async () => {
    if (!vendorType) {
      setError('Please select a vendor type');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setGeneratedCode('');

    try {
      const response = await axios.post('/vendor-code/generate', { vendorType });
      
      setGeneratedCode(response.data.data.code);
      setSuccess('Code generated successfully! Valid for 24 hours.');
      loadActiveCodes();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteCode = async (id) => {
    if (window.confirm('Are you sure you want to delete this code?')) {
      try {
        await axios.delete(`/vendor-code/${id}`);
        setSuccess('Code deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
        loadActiveCodes();
        loadStats();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete code');
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await axios.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear user data
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        router.push('/login');
      }
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const vendorTypes = [
    { value: 'canteen-vendor', label: 'Canteen Vendor', icon: Store },
    { value: 'stationary-vendor', label: 'Stationary Vendor', icon: ShoppingBag }
  ];

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
        } transition-colors duration-300`} />
        <div className="absolute top-[-10%] left-[10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-start">
          <div className="text-center flex-1">
            <div className="relative group mx-auto mb-5 w-20 h-20">
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate Vendor Registration Code
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create secure 6-digit codes for vendor account registration
            </p>
            {currentUser && (
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Welcome, {currentUser.name}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
            } text-white transition-colors`}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'blue' },
            { label: 'Active', value: stats.active, color: 'green' },
            { label: 'Used', value: stats.used, color: 'purple' },
            { label: 'Expired', value: stats.expired, color: 'red' }
          ].map((stat) => (
            <div key={stat.label} className={`${
              darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
            } backdrop-blur-md rounded-lg border p-4 shadow-md`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate Code Section */}
          <div className={`${
            darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
          } backdrop-blur-md rounded-lg border p-6 shadow-md`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate New Code
            </h2>

            {/* Status Messages */}
            {error && (
              <div className={`mb-4 p-3 rounded-lg border-l-4 ${
                darkMode ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-50/80 border-red-400 text-red-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className={`mb-4 p-3 rounded-lg border-l-4 ${
                darkMode ? 'bg-green-900/20 border-green-500 text-green-300' : 'bg-green-50/80 border-green-400 text-green-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              </div>
            )}

            {/* Vendor Type Selection */}
            <div className="space-y-3 mb-6">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Vendor Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {vendorTypes.map(({ value, label, icon: Icon }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="vendorType"
                      value={value}
                      checked={vendorType === value}
                      onChange={(e) => setVendorType(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border text-left transition-all duration-200 flex items-center gap-3 ${
                      vendorType === value
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : darkMode
                        ? 'border-gray-700 bg-gray-800/50 hover:border-indigo-600'
                        : 'border-gray-200 bg-white/50 hover:border-indigo-600'
                    }`}>
                      <Icon className={`w-6 h-6 ${vendorType === value ? 'text-indigo-600' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${vendorType === value ? 'text-indigo-600' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating || !vendorType}
              className="w-full py-3 px-5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Generate Code</span>
                </div>
              )}
            </button>

            {/* Generated Code Display */}
            {generatedCode && (
              <div className={`mt-6 p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Generated Code
                </label>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 px-4 py-3 rounded-lg border font-mono text-2xl text-center font-bold tracking-widest ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    {generatedCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`p-3 rounded-lg transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : darkMode
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className={`text-xs mt-2 flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3" />
                  This code will expire in 24 hours
                </p>
              </div>
            )}
          </div>

          {/* Active Codes Section */}
          <div className={`${
            darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
          } backdrop-blur-md rounded-lg border p-6 shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Active Codes
              </h2>
              <button
                onClick={loadActiveCodes}
                className={`p-2 rounded-lg transition-all ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoadingCodes ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : activeCodes.length === 0 ? (
              <div className="text-center py-12">
                <Key className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No active codes. Generate a new code to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeCodes.map((codeData) => (
                  <div
                    key={codeData._id}
                    className={`p-4 rounded-lg border ${
                      darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-mono text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {codeData.code}
                          </span>
                          {codeData.vendorType === 'canteen-vendor' ? (
                            <Store className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {codeData.vendorType === 'canteen-vendor' ? 'Canteen Vendor' : 'Stationary Vendor'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCode(codeData._id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3" />
                      {getTimeRemaining(codeData.expiresAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={`mt-6 p-4 rounded-lg border ${
          darkMode ? 'bg-blue-900/20 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Generated codes are valid for 24 hours from creation</li>
            <li>Share the code with vendors to register on the system</li>
            <li>Each code can only be used once for registration</li>
            <li>Expired codes are automatically removed from the system</li>
            <li>Vendors must select the correct role matching the code type</li>
          </ul>
        </div>
      </div>
    </div>
  );
}