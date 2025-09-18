"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "../../../context/ThemeProvider";
import api from "@/lib/axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const InventoryUpdatePage = () => {
  const { darkMode } = useTheme();

  // Force component to re-render when localStorage changes
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for theme changes in localStorage
  useEffect(() => {
    const handleThemeChange = () => {
      // Force re-render by updating a dummy state
      setMounted((prev) => !prev);
    };

    // Listen for storage events (theme changes from other tabs/components)
    window.addEventListener("storage", handleThemeChange);

    // Also listen for manual localStorage changes in same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      const result = originalSetItem.apply(this, arguments);
      if (key === "theme") {
        setTimeout(handleThemeChange, 0); // Async to avoid infinite loops
      }
      return result;
    };

    return () => {
      window.removeEventListener("storage", handleThemeChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Get theme directly from localStorage as backup
  const [localStorageTheme, setLocalStorageTheme] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme");
      const isDark = theme === "true" || theme === '"true"';
      setLocalStorageTheme(isDark);
    }
  }, [mounted]);

  // Use localStorage theme if context theme seems wrong
  const effectiveDarkMode = darkMode ?? localStorageTheme;

  const [inventoryItem, setInventoryItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [deductQuantity, setDeductQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [vendorId, setVendorId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const params = useParams();
  const router = useRouter();

  // Define allowed roles
  const ALLOWED_ROLES = ["canteen-vendor", "stationary-vendor"];

  useEffect(() => {
    const checkAuthAndFetchInventoryItem = async () => {
      try {
        // Get user information from session
        const storedUser = sessionStorage.getItem("user");
        console.log("Raw stored user:", storedUser);

        if (!storedUser) {
          console.log("No user found in session storage");
          setError("Please login to view inventory details.");
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
          setError(
            "Access denied. This page is only accessible to canteen and stationary vendors."
          );
          setLoading(false);
          return;
        }

        console.log("User authorized with role:", user.role);
        setVendorId(user._id);

        if (!params.id) {
          setError("Inventory item ID is missing.");
          setLoading(false);
          return;
        }

        console.log("Fetching inventory item for ID:", params.id);

        // Fetch all inventory items and find the specific one
        const response = await api.get(`/inventory`);
        const inventoryList = response.data.inventory || [];

        const item = inventoryList.find((inv) => inv._id === params.id);

        if (!item) {
          setError("Inventory item not found.");
          setLoading(false);
          return;
        }

        setInventoryItem(item);
        console.log("Inventory item fetched:", item);
      } catch (err) {
        console.error("Error fetching inventory item:", err);

        // Handle specific API errors
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setAccessDenied(true);
          setError(
            "Access forbidden. You don't have permission to view this inventory item."
          );
        } else if (err.response?.status === 404) {
          setError("Inventory item not found.");
        } else {
          setError(`Failed to fetch inventory item: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      checkAuthAndFetchInventoryItem();
    } else {
      setError("Inventory item ID is required.");
      setLoading(false);
    }
  }, [params.id]);

  // Handle restock
  const handleRestock = async () => {
    if (!restockQuantity || parseInt(restockQuantity) <= 0) {
      setMessage("Please enter a valid quantity to restock.");
      setMessageType("error");
      return;
    }

    setUpdating(true);
    setMessage("");

    try {
      const response = await api.patch(`/inventory/${params.id}/restock`, {
        quantity: parseInt(restockQuantity),
      });

      console.log("Restock response:", response.data);

      // Update local state
      setInventoryItem((prev) => ({
        ...prev,
        quantityAvailable: response.data.inventoryItem.quantityAvailable,
        lastRestockedAT: response.data.inventoryItem.lastRestockedAT,
      }));

      setMessage(response.data.message || "Inventory restocked successfully!");
      setMessageType("success");
      setRestockQuantity("");
    } catch (err) {
      console.error("Error restocking:", err);

      if (err.response?.status === 401) {
        setMessage("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setMessage(
          "Access forbidden. You don't have permission to update this inventory."
        );
      } else {
        setMessage(err.response?.data?.error || "Failed to restock inventory.");
      }
      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  };

  // Handle deduct
  const handleDeduct = async () => {
    if (!deductQuantity || parseInt(deductQuantity) <= 0) {
      setMessage("Please enter a valid quantity to deduct.");
      setMessageType("error");
      return;
    }

    if (parseInt(deductQuantity) > inventoryItem.quantityAvailable) {
      setMessage("Cannot deduct more than available stock.");
      setMessageType("error");
      return;
    }

    setUpdating(true);
    setMessage("");

    try {
      const response = await api.patch(`/inventory/${params.id}/deduct`, {
        quantity: parseInt(deductQuantity),
      });

      console.log("Deduct response:", response.data);

      // Update local state
      setInventoryItem((prev) => ({
        ...prev,
        quantityAvailable: response.data.inventoryItem.quantityAvailable,
        lastRestockedAT: response.data.inventoryItem.lastRestockedAT,
      }));

      setMessage(response.data.message || "Inventory deducted successfully!");
      setMessageType("success");
      setDeductQuantity("");
    } catch (err) {
      console.error("Error deducting:", err);

      if (err.response?.status === 401) {
        setMessage("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setMessage(
          "Access forbidden. You don't have permission to update this inventory."
        );
      } else {
        setMessage(err.response?.data?.error || "Failed to deduct inventory.");
      }
      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Get stock status color with dark mode support
  const getStockStatusColor = (quantity, lowStockThreshold) => {
    if (quantity === 0) {
      return effectiveDarkMode
        ? "bg-red-900/30 text-red-400"
        : "bg-red-100 text-red-800";
    } else if (quantity <= lowStockThreshold) {
      return effectiveDarkMode
        ? "bg-yellow-900/30 text-yellow-400"
        : "bg-yellow-100 text-yellow-800";
    } else {
      return effectiveDarkMode
        ? "bg-green-900/30 text-green-400"
        : "bg-green-100 text-green-800";
    }
  };

  // Get stock status text
  const getStockStatusText = (quantity, lowStockThreshold) => {
    if (quantity === 0) {
      return "Out of Stock";
    } else if (quantity <= lowStockThreshold) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  // Get stock text color with dark mode support
  const getStockTextColor = (quantity, lowStockThreshold) => {
    if (effectiveDarkMode) {
      if (quantity === 0) return "text-red-400";
      if (quantity <= lowStockThreshold) return "text-yellow-400";
      return "text-green-400";
    } else {
      if (quantity === 0) return "text-red-600";
      if (quantity <= lowStockThreshold) return "text-yellow-600";
      return "text-green-600";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          effectiveDarkMode ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center transition-colors`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              effectiveDarkMode ? "border-blue-400" : "border-blue-600"
            } mx-auto mb-4`}
          ></div>
          <p className={effectiveDarkMode ? "text-gray-300" : "text-gray-600"}>
            Loading inventory details...
          </p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div
        className={`min-h-screen ${
          effectiveDarkMode ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center transition-colors`}
      >
        <div
          className={`text-center ${
            effectiveDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white"
          } rounded-2xl shadow-lg p-8 max-w-md`}
        >
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
            </svg>
          </div>
          <h2
            className={`text-xl font-semibold ${
              effectiveDarkMode ? "text-gray-100" : "text-gray-800"
            } mb-2`}
          >
            Access Denied
          </h2>
          <p
            className={`${
              effectiveDarkMode ? "text-gray-300" : "text-gray-600"
            } mb-2`}
          >
            This page is restricted to:
          </p>
          <ul
            className={`text-sm ${
              effectiveDarkMode ? "text-gray-400" : "text-gray-500"
            } mb-6`}
          >
            <li>• Canteen Vendors</li>
            <li>• Stationary Vendors</li>
          </ul>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className={`${
                effectiveDarkMode
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white px-6 py-2 rounded-lg transition-colors`}
            >
              Login with Vendor Account
            </Link>
            <Link
              href="/dashboard/inventory"
              className={`${
                effectiveDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-700"
              } px-6 py-2 rounded-lg transition-colors`}
            >
              Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state (for other errors)
  if (error && !accessDenied) {
    return (
      <div
        className={`min-h-screen ${
          effectiveDarkMode ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center transition-colors`}
      >
        <div
          className={`text-center ${
            effectiveDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white"
          } rounded-2xl shadow-lg p-8 max-w-md`}
        >
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className={`text-xl font-semibold ${
              effectiveDarkMode ? "text-gray-100" : "text-gray-800"
            } mb-2`}
          >
            Error
          </h2>
          <p
            className={`${
              effectiveDarkMode ? "text-gray-300" : "text-gray-600"
            } mb-6`}
          >
            {error}
          </p>
          <Link
            href="/dashboard/inventory"
            className={`${
              effectiveDarkMode
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-lg transition-colors`}
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  if (!inventoryItem) {
    return null;
  }

  const product = inventoryItem.productId;
  const quantity = inventoryItem.quantityAvailable;
  const lowStockThreshold = product?.lowStockThreshold || 10;

  return (
    <div
      className={`min-h-screen ${
        effectiveDarkMode ? "bg-gray-900" : "bg-gray-100"
      } p-6 transition-colors`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${
                effectiveDarkMode ? "text-gray-100" : "text-gray-800"
              } mb-2`}
            >
              Update Inventory
            </h1>
            <p
              className={effectiveDarkMode ? "text-gray-300" : "text-gray-600"}
            >
              Manage stock levels for {product?.name}
            </p>
          </div>

          <Link href="/dashboard/inventory">
            <button
              className={`${
                effectiveDarkMode
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white px-6 py-3 rounded-2xl shadow-lg transition-colors mt-4 sm:mt-0`}
            >
              Back to Inventory
            </button>
          </Link>
        </div>

        {/* Debug Info (remove in production) */}
        <div
          className={`${
            effectiveDarkMode
              ? "bg-yellow-900/20 border-yellow-700"
              : "bg-yellow-50 border-yellow-200"
          } border rounded-lg p-4 mb-6`}
        >
          <h3
            className={`text-sm font-semibold ${
              effectiveDarkMode ? "text-yellow-200" : "text-yellow-800"
            } mb-2`}
          >
            Debug Info:
          </h3>
          <p
            className={`text-xs ${
              effectiveDarkMode ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Vendor ID: {vendorId}
          </p>
          <p
            className={`text-xs ${
              effectiveDarkMode ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Inventory Item ID: {params.id}
          </p>
          <p
            className={`text-xs ${
              effectiveDarkMode ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Current Stock: {quantity}
          </p>
          <p
            className={`text-xs ${
              effectiveDarkMode ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Product Name: {product?.name}
          </p>
          <p
            className={`text-xs ${
              effectiveDarkMode ? "text-yellow-300" : "text-yellow-700"
            }`}
          >
            Dark Mode: {effectiveDarkMode ? "Enabled" : "Disabled"}
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "success"
                ? effectiveDarkMode
                  ? "bg-green-900/20 border border-green-700 text-green-400"
                  : "bg-green-50 border border-green-200 text-green-800"
                : effectiveDarkMode
                ? "bg-red-900/20 border border-red-700 text-red-400"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {messageType === "success" ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information Card */}
          <div
            className={`${
              effectiveDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white"
            } rounded-2xl shadow-lg overflow-hidden transition-colors`}
          >
            {/* Product Image */}
            <div
              className={`relative h-64 ${
                effectiveDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {product?.imgUrl ? (
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg
                    className={`w-16 h-16 ${
                      effectiveDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Stock Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-2 rounded-full text-sm font-semibold ${getStockStatusColor(
                    quantity,
                    lowStockThreshold
                  )}`}
                >
                  {getStockStatusText(quantity, lowStockThreshold)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h2
                className={`text-2xl font-bold ${
                  effectiveDarkMode ? "text-gray-100" : "text-gray-800"
                } mb-4`}
              >
                {product?.name}
              </h2>

              {product?.description && (
                <p
                  className={`${
                    effectiveDarkMode ? "text-gray-300" : "text-gray-600"
                  } mb-4`}
                >
                  {product.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span
                    className={
                      effectiveDarkMode ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Category:
                  </span>
                  <span
                    className={`font-medium ${
                      effectiveDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {product?.category || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={
                      effectiveDarkMode ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Price:
                  </span>
                  <span
                    className={`font-bold ${
                      effectiveDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    ${(product?.price || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={
                      effectiveDarkMode ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Current Stock:
                  </span>
                  <span
                    className={`font-bold text-lg ${getStockTextColor(
                      quantity,
                      lowStockThreshold
                    )}`}
                  >
                    {quantity} units
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={
                      effectiveDarkMode ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Low Stock Alert:
                  </span>
                  <span
                    className={`font-medium ${
                      effectiveDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {lowStockThreshold} units
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={
                      effectiveDarkMode ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    Last Restocked:
                  </span>
                  <span
                    className={`font-medium ${
                      effectiveDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {formatDate(inventoryItem.lastRestockedAT)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management Card */}
          <div
            className={`${
              effectiveDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white"
            } rounded-2xl shadow-lg p-6 transition-colors`}
          >
            <h3
              className={`text-xl font-bold ${
                effectiveDarkMode ? "text-gray-100" : "text-gray-800"
              } mb-6`}
            >
              Manage Stock
            </h3>

            {/* Restock Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <svg
                  className={`w-6 h-6 ${
                    effectiveDarkMode ? "text-green-400" : "text-green-600"
                  } mr-2`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <h4
                  className={`text-lg font-semibold ${
                    effectiveDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Restock Inventory
                </h4>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="restockQuantity"
                  className={`block text-sm font-medium ${
                    effectiveDarkMode ? "text-gray-200" : "text-gray-700"
                  } mb-2`}
                >
                  Quantity to Add
                </label>
                <input
                  type="number"
                  id="restockQuantity"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    effectiveDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter quantity to add"
                  min="1"
                  disabled={updating}
                />
              </div>

              <button
                onClick={handleRestock}
                disabled={updating || !restockQuantity}
                className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center ${
                  updating || !restockQuantity
                    ? effectiveDarkMode
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : effectiveDarkMode
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Stock
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div
              className={`border-t ${
                effectiveDarkMode ? "border-gray-600" : "border-gray-200"
              } my-8`}
            ></div>

            {/* Deduct Section */}
            {/* Deduct Section */}
            <div>
              <div className="flex items-center mb-4">
                <svg
                  className={`w-6 h-6 ${
                    effectiveDarkMode ? "text-red-400" : "text-red-600"
                  } mr-2`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
                <h4
                  className={`text-lg font-semibold ${
                    effectiveDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Deduct Inventory
                </h4>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="deductQuantity"
                  className={`block text-sm font-medium mb-2 ${
                    effectiveDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Quantity to Remove
                </label>
                <input
                  type="number"
                  id="deductQuantity"
                  value={deductQuantity}
                  onChange={(e) => setDeductQuantity(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                    effectiveDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter quantity to remove"
                  min="1"
                  max={quantity}
                  disabled={updating || quantity === 0}
                />
                {quantity > 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      effectiveDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Maximum available: {quantity} units
                  </p>
                )}
              </div>

              <button
                onClick={handleDeduct}
                disabled={updating || !deductQuantity || quantity === 0}
                className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center ${
                  updating || !deductQuantity || quantity === 0
                    ? effectiveDarkMode
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : effectiveDarkMode
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                    Remove Stock
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryUpdatePage;
