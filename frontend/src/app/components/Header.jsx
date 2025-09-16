"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon, Menu, X, Bell, User } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";

export default function Header({ isLoggedIn = false, userRole = null }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [{ name: "Students", href: "/students", adminOnly: true }];

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresAuth && !isLoggedIn) return false;
    if (item.adminOnly && userRole !== "admin") return false;
    return true;
  });

  return (
    <header
      className={`${
        darkMode
          ? `bg-gray-900/95 border-gray-700 ${
              scrolled ? "shadow-2xl shadow-purple-500/10" : ""
            }`
          : `bg-white/95 border-gray-200 ${scrolled ? "shadow-xl" : ""}`
      } border-b backdrop-blur-md fixed w-full top-0 z-50 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Responsive sizing */}
          <div className="flex items-center group cursor-pointer min-w-0 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-sm sm:text-lg">
                  IC
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-200"></div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                InstaCampus
              </h1>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } -mt-0.5 sm:-mt-1 hidden sm:block`}
              >
                Campus Management
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {filteredNavItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group whitespace-nowrap ${
                  darkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
              </a>
            ))}
          </nav>

          {/* Right side actions - Responsive layout */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Notifications - Only show if logged in */}
            {isLoggedIn && (
              <button
                className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {notifications > 9 ? "9+" : notifications}
                  </span>
                )}
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Auth buttons - Desktop only */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <button className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-600 transition-colors whitespace-nowrap">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <a
                  href="/login"
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="relative px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 group overflow-hidden whitespace-nowrap"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </a>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-colors ${
                darkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-t ${
              darkMode
                ? "border-gray-700 bg-gray-900"
                : "border-gray-200 bg-white"
            } py-3 sm:py-4 animate-in slide-in-from-top-2 duration-200`}
          >
            <nav className="space-y-1 sm:space-y-2">
              {filteredNavItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                    darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}

              {/* Mobile user profile section for logged in users */}
              {isLoggedIn && (
                <div className="px-2 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 mt-3 sm:mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Profile
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile auth buttons */}
              {!isLoggedIn && (
                <div className="px-2 pt-3 sm:pt-4 space-y-2">
                  <a
                    href="/login"
                    className={`block w-full text-center px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-colors ${
                      darkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="block w-full text-center px-4 py-2.5 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              )}

              {/* Mobile logout button */}
              {isLoggedIn && (
                <div className="px-2 pt-2">
                  <button
                    className="block w-full text-center px-4 py-2.5 sm:py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
