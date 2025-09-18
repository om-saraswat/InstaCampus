"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import api from "../../lib/axios";

export default function LoginPage() {
  const { darkMode } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
        rememberMe,
      });

      // Log the full response for debugging
      console.log("Full API response:", res.data);

      // Handle different possible response structures
      let token, user, message;
      if (res.data.token && res.data.user) {
        ({ token, user, message } = res.data);
      } else if (res.data.data && res.data.data.token && res.data.data.user) {
        ({ token, user, message } = res.data.data);
      } else if (res.data.success && (res.data.token || res.data.jwt)) {
        token = res.data.token || res.data.jwt;
        user = res.data.user || { role: "student" };
        message = res.data.message;
      } else if (res.data.jwt) {
        token = res.data.jwt;
        user = res.data.user || { role: "student" };
        message = res.data.message || "Login successful";
      } else if (res.data.userObj && res.data.message) {
        user = res.data.userObj;
        message = res.data.message;
        token = null;
        console.warn(
          "No token provided in response, proceeding with user data:",
          user
        );
      } else {
        throw new Error(
          `Invalid response structure: Expected token/jwt or userObj and message, got ${JSON.stringify(
            res.data
          )}`
        );
      }

      // Store token and user data (if token exists)
      if (token) {
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        console.warn("Token missing, storing user data only");
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
        }
      }

      setSuccess(message || "Login successful! Redirecting...");

      // Redirect to StudentDashboard
      setTimeout(() => {
  if (user?.role === "student") {
    window.location.href = "/vendor";
  } else if (
    user?.role === "canteen-vendor" || 
    user?.role === "stationary-vendor"
  ) {
    window.location.href = "/dashboard";
  } else {
    console.warn("Unknown role:", user?.role);
    window.location.href = "/"; // fallback (maybe home)
  }
}, 1000);
    } catch (err) {
      console.error("Login error:", err, "Response:", err.response?.data);
      if (err.response?.status === 404) {
        setError("Login endpoint not found. Please contact support.");
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Failed to log in. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = form.email && form.password;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-gradient-to-br from-gray-900 via-indigo-900/10 to-purple-900/10"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
          } transition-colors duration-300`}
        />
        <div className="absolute top-[-10%] left-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <main className="relative flex-1 flex items-center justify-center py-8 px-4 sm:py-12 pt-24">
        <div className="max-w-md w-full">
          <div
            className={`${
              darkMode
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white/50 border-gray-200/50"
            } backdrop-blur-md rounded-lg border p-6 sm:p-8 shadow-md transition-all duration-300 hover:shadow-lg`}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="relative group mx-auto mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                } tracking-tight`}
              >
                Welcome Back
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } leading-relaxed`}
              >
                Sign in to your InstaCampus account
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div
                className={`mb-5 p-3 rounded-lg border-l-4 ${
                  darkMode
                    ? "bg-red-900/20 border-red-500 text-red-300"
                    : "bg-red-50/80 border-red-400 text-red-600"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div
                className={`mb-5 p-3 rounded-lg border-l-4 ${
                  darkMode
                    ? "bg-green-900/20 border-green-500 text-green-300"
                    : "bg-green-50/80 border-green-400 text-green-600"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative group mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    }`}
                    placeholder="student@ggsipu.ac.in"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <div className="relative group mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Remember me
                  </span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-2.5 px-5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-600/50`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm">Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Create one here
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
