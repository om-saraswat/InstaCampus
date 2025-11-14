"use client";
import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  UserCheck,
  Store,
  ShoppingBag,
  Key,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import api from "@/lib/axios";

export default function RegisterPage() {
  const { darkMode } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    vendorCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    
    // Reset code verification when vendor code changes
    if (e.target.name === 'vendorCode') {
      setCodeVerified(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!form.vendorCode || !form.role) {
      setError("Please select a role and enter the vendor code");
      return;
    }

    setIsVerifyingCode(true);
    setError("");
    
    try {
      const response = await api.post("/vendor-code/verify", {
        code: form.vendorCode,
        vendorType: form.role
      });

      if (response.data.success) {
        setCodeVerified(true);
        setSuccess("Code verified successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired vendor code");
      setCodeVerified(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions");
      return false;
    }
    if (!form.role) {
      setError("Please select a role");
      return false;
    }
    
    // Check if vendor code is required and verified
    if ((form.role === 'canteen-vendor' || form.role === 'stationary-vendor') && !codeVerified) {
      setError("Please verify your vendor code before registering");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      // Add vendor code for vendors
      if (form.role === 'canteen-vendor' || form.role === 'stationary-vendor') {
        payload.vendorCode = form.vendorCode;
      }

      const response = await api.post("/auth/signup", payload);

      console.log("Full API response:", response.data);

      let message;
      if (response.data.success) {
        message =
          response.data.message ||
          "Account created successfully! Check your email.";
      } else if (response.data.message) {
        message = response.data.message;
      } else {
        message = "Account created successfully! You can now log in.";
      }

      setSuccess(message);
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        vendorCode: "",
      });
      setAcceptedTerms(false);
      setCodeVerified(false);

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      console.error("Register error:", err, "Response:", err.response?.data);
      if (err.response?.status === 404) {
        setError("Registration endpoint not found. Please contact support.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong. Try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const baseValid = form.name && form.email && form.password && form.confirmPassword && form.role && acceptedTerms;
    
    if (form.role === 'canteen-vendor' || form.role === 'stationary-vendor') {
      return baseValid && codeVerified;
    }
    
    return baseValid;
  };

  const roleOptions = [
    { value: "student", label: "Student", icon: GraduationCap },
    { value: "canteen-vendor", label: "Canteen Vendor", icon: Store },
    { value: "stationary-vendor", label: "Stationary Vendor", icon: ShoppingBag },
    { value: "admin", label: "Administrator", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
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
        <div className="max-w-lg w-full">
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
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                } tracking-tight`}
              >
                Join InstaCampus
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } leading-relaxed`}
              >
                Create your account for GGSIPU Campus
              </p>
            </div>

            {/* Status Messages */}
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
              {/* Name */}
              <div className="space-y-1">
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
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

              {/* Role */}
              <div className="space-y-1">
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleOptions.map(({ value, label, icon: Icon }) => (
                    <label key={value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={form.role === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                          form.role === value
                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-600"
                            : darkMode
                            ? "border-gray-700 bg-gray-800/50 text-gray-300"
                            : "border-gray-200 bg-white/50 text-gray-700"
                        } hover:border-indigo-600 hover:bg-indigo-50/50`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Vendor Code (for vendors only) */}
              {(form.role === 'canteen-vendor' || form.role === 'stationary-vendor') && (
                <div className="space-y-1">
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Vendor Registration Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="vendorCode"
                        value={form.vendorCode}
                        onChange={handleChange}
                        maxLength={6}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border transition-all duration-200 ${
                          codeVerified
                            ? "border-green-500 bg-green-50/20"
                            : darkMode
                            ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                            : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        }`}
                        placeholder="Enter 6-digit code"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || codeVerified || !form.vendorCode}
                      className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        codeVerified
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isVerifyingCode ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : codeVerified ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {codeVerified && (
                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      Code verified successfully
                    </p>
                  )}
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    }`}
                    placeholder="Create a strong password"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-indigo-600"
                  required
                />
                <label
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`w-full py-2.5 px-5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-600/50`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm">Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Already have an account?{" "}
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