"use client";
import React, { useState } from "react";
import {
  Mail,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import api from "../../lib/axios";

export default function ForgotPasswordPage() {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });

      // Log response for debugging
      console.log("Full API response:", response.data);

      // Handle response
      let message;
      if (response.data.success) {
        message =
          response.data.message || "Password reset link sent to your email.";
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        throw new Error(
          `Invalid response structure: Expected success and message, got ${JSON.stringify(
            response.data
          )}`
        );
      }

      setSuccess(message);
      setEmail("");
    } catch (err) {
      console.error(
        "Forgot password error:",
        err,
        "Response:",
        err.response?.data
      );
      if (err.response?.status === 404) {
        setError("Password reset endpoint not found. Please contact support.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to send reset link. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col">
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
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                } tracking-tight`}
              >
                Reset Your Password
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } leading-relaxed`}
              >
                Enter your email to receive a password reset link
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
                    value={email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    }`}
                    placeholder="your.email@ggsipu.ac.in"
                    required
                  />
                </div>
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
                    <span className="text-sm">Sending Reset Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm">Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Remember your password?{" "}
                <a
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
