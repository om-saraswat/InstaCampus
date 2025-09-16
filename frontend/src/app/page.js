"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  BookOpen,
  Coffee,
  Users,
  Star,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "./context/ThemeProvider";

export default function Home() {
  const { darkMode } = useTheme();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Coffee,
      title: "Campus Food Delivery",
      description: "Order from canteens and cafes across GGSIPU.",
      color: "from-indigo-500 via-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Stationery & Supplies",
      description: "Get notebooks and pens delivered to you.",
      color: "from-indigo-500 via-purple-500 to-pink-500",
    },
    {
      icon: ShoppingCart,
      title: "Daily Essentials",
      description: "Shop toiletries and snacks on campus.",
      color: "from-indigo-500 via-purple-500 to-pink-500",
    },
  ];

  const stats = [
    { label: "Active Users", value: "5,000+", icon: Users },
    { label: "Orders Delivered", value: "50,000+", icon: CheckCircle },
    { label: "Avg Delivery Time", value: "15 min", icon: Clock },
    { label: "Campus Vendors", value: "25+", icon: Star },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Quick Delivery",
      description: "Orders delivered in 15-20 minutes.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe transactions with trusted gateways.",
    },
    {
      icon: Users,
      title: "Campus Community",
      description: "For GGSIPU students and faculty.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Background Pattern */}
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

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/20 mb-5 shadow-sm">
              <span
                className={`text-xs font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Serving GGSIPU Campus
              </span>
            </div>

            <h1
              className={`text-3xl sm:text-4xl font-bold mb-4 leading-tight tracking-tight ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Order{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Food & Essentials
              </span>
              <br />
              at{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                GGSIPU
              </span>
            </h1>

            <p
              className={`max-w-2xl mx-auto text-sm sm:text-base mb-8 leading-relaxed ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              InstaCampus delivers food, stationery, and essentials to GGSIPU
              students and faculty with ease.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="group relative w-full sm:w-44 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-600/50">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <span className="text-sm">Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <button
                className={`group relative w-full sm:w-44 px-5 py-2.5 font-medium rounded-lg border transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/70 hover:border-gray-600"
                    : "bg-white/50 border-gray-200 text-gray-600 hover:bg-gray-100/70 hover:border-gray-300"
                } backdrop-blur-md`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-sm">Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>
          </div>

          {/* Feature Showcase */}
          <div className="max-w-3xl mx-auto">
            <div
              className={`${
                darkMode
                  ? "bg-gray-800/50 border-gray-700/50"
                  : "bg-white/50 border-gray-200/50"
              } backdrop-blur-md rounded-lg border p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex flex-col md:flex-row items-center space-y-5 md:space-y-0 md:space-x-6">
                <div className="flex-1 text-left">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${features[currentFeature].color} mb-3 shadow-md`}
                  >
                    {(() => {
                      const Icon = features[currentFeature].icon;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    } tracking-tight`}
                  >
                    {features[currentFeature].title}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    } leading-relaxed`}
                  >
                    {features[currentFeature].description}
                  </p>
                </div>

                <div className="flex space-x-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      aria-label={`View ${features[index].title}`}
                      className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                        index === currentFeature
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 scale-125"
                          : darkMode
                          ? "bg-gray-600 hover:bg-gray-500"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/50 border-gray-200/50"
                } backdrop-blur-md rounded-lg border p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md`}
              >
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-3 shadow-md transition-transform duration-300 hover:scale-110`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div
                  className={`text-xl font-bold mb-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  } tracking-tight`}
                >
                  {value}
                </div>
                <div
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className={`text-2xl font-bold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              } tracking-tight`}
            >
              Why Choose InstaCampus?
            </h2>
            <p
              className={`text-sm max-w-xl mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } leading-relaxed`}
            >
              Seamless convenience for the GGSIPU community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className={`${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/50 border-gray-200/50"
                } backdrop-blur-md rounded-lg border p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md group`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  } tracking-tight`}
                >
                  {title}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } leading-relaxed`}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className={`${
              darkMode
                ? "bg-gray-800/50 border-gray-700/50"
                : "bg-white/50 border-gray-200/50"
            } backdrop-blur-md rounded-lg border p-6 sm:p-8 shadow-md transition-all duration-300 hover:shadow-lg`}
          >
            <h2
              className={`text-2xl font-bold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              } tracking-tight`}
            >
              Join InstaCampus Today
            </h2>
            <p
              className={`text-sm mb-6 max-w-xl mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } leading-relaxed`}
            >
              Be part of the GGSIPU community enjoying fast campus deliveries.
            </p>
            <Link href="/signup">
              <button className="group relative px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-600/50">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center justify-center space-x-1">
                  <span className="text-sm">Join Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
