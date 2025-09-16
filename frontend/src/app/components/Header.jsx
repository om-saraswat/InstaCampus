"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";

export default function Header({
  isLoggedIn: propIsLoggedIn = null,
  userRole: propUserRole = null,
  userName: propUserName = null,
}) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mounted, setMounted] = useState(false);

  // Auth state - will be determined from localStorage/sessionStorage
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userName: "",
    userRole: "",
  });

  const dropdownRef = useRef(null);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status on mount and when props change
  useEffect(() => {
    if (!mounted) return;

    // If props are provided, use them (for controlled usage)
    if (propIsLoggedIn !== null) {
      setAuthState({
        isLoggedIn: propIsLoggedIn,
        userName: propUserName || "User",
        userRole: propUserRole || "student",
      });
      return;
    }

    // Otherwise, check localStorage/sessionStorage (for automatic detection)
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token || userStr) {
        const user = userStr ? JSON.parse(userStr) : {};
        setAuthState({
          isLoggedIn: true,
          userName:
            user.name ||
            user.fullName ||
            user.firstName + " " + user.lastName ||
            "User",
          userRole: user.role || "student",
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          userName: "",
          userRole: "",
        });
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      setAuthState({
        isLoggedIn: false,
        userName: "",
        userRole: "",
      });
    }
  }, [mounted, propIsLoggedIn, propUserName, propUserRole]);

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [{ name: "Students", href: "/students", adminOnly: true }];

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresAuth && !authState.isLoggedIn) return false;
    if (item.adminOnly && authState.userRole !== "admin") return false;
    return true;
  });

  const handleLogout = () => {
    try {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Update state
      setAuthState({
        isLoggedIn: false,
        userName: "",
        userRole: "",
      });

      setProfileDropdownOpen(false);

      // Redirect to login or home page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleSettings = () => {
    console.log("Opening settings...");
    setProfileDropdownOpen(false);
    // Add settings navigation logic here
    window.location.href = "/settings";
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white/95 border-b backdrop-blur-md fixed w-full top-0 z-50 h-14 sm:h-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

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
          <a
            href="/"
            className="flex items-center group cursor-pointer min-w-0 flex-shrink-0 no-underline"
          >
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
          </a>

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
            {authState.isLoggedIn && (
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
            {authState.isLoggedIn ? (
              <div
                className="hidden md:flex items-center relative"
                ref={dropdownRef}
              >
                {/* Profile Button with Dropdown */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-2 p-1 rounded-lg transition-all duration-200 ${
                    profileDropdownOpen
                      ? darkMode
                        ? "bg-gray-800"
                        : "bg-gray-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {getUserInitials(authState.userName)}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border backdrop-blur-md z-50 ${
                      darkMode
                        ? "bg-gray-800/95 border-gray-700"
                        : "bg-white/95 border-gray-200"
                    } animate-in slide-in-from-top-2 duration-200`}
                  >
                    {/* User Info */}
                    <div
                      className={`px-4 py-3 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {authState.userName}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } capitalize`}
                      >
                        {authState.userRole}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleSettings}
                        className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                          darkMode
                            ? "text-gray-300 hover:text-white hover:bg-gray-700"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                          darkMode
                            ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        }`}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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
              {authState.isLoggedIn && (
                <div className="px-2 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 mt-3 sm:mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {getUserInitials(authState.userName)}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {authState.userName}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } capitalize`}
                      >
                        {authState.userRole}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Settings Button */}
                  <button
                    onClick={handleSettings}
                    className={`w-full flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg mx-3 transition-colors ${
                      darkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                </div>
              )}

              {/* Mobile auth buttons */}
              {!authState.isLoggedIn && (
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
              {authState.isLoggedIn && (
                <div className="px-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-2.5 sm:py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
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
