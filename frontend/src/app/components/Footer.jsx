"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";

export default function Footer() {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Order Food", href: "/food" },
    { name: "Stationery", href: "/stationery" },
    { name: "Essentials", href: "/essentials" },
    { name: "About Us", href: "/about" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund & Cancellation", href: "/refunds" },
  ];

  return (
    <footer
      className={`${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
      } border-t transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
          {/* Brand - Takes full width on mobile, 2 columns on lg+ */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm sm:text-base">
                  IC
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                InstaCampus
              </h3>
            </div>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-sm sm:text-base max-w-full sm:max-w-md leading-relaxed`}
            >
              InstaCampus is your one-stop platform at GGSIPU to order food,
              stationery, and everyday essentials directly within the campus.
              Fast, reliable, and built for students and faculty.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4 mt-4 sm:mt-6">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                    darkMode
                      ? "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                      : "bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm hover:shadow-md"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:col-span-1">
            <h4
              className={`font-semibold mb-3 sm:mb-4 text-base sm:text-lg ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className={`${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-indigo-600"
                    } text-sm sm:text-base transition-colors duration-200 hover:translate-x-1 inline-block`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="sm:col-span-1">
            <h4
              className={`font-semibold mb-3 sm:mb-4 text-base sm:text-lg ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Contact Us
            </h4>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <li className="flex items-start space-x-3">
                <Mail
                  className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <a
                  href="mailto:support@instacampus.com"
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-indigo-600"
                  } transition-colors duration-200 break-all sm:break-normal`}
                >
                  support@instacampus.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone
                  className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <a
                  href="tel:+1555123456"
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-indigo-600"
                  } transition-colors duration-200`}
                >
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin
                  className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <span
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } leading-relaxed`}
                >
                  GGSIPU Main Campus, Dwarka, New Delhi
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } pt-6 sm:pt-8`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <p
              className={`text-xs sm:text-sm text-center sm:text-left ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © {currentYear} InstaCampus • Built for GGSIPU students & faculty
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <a
                    href={link.href}
                    className={`text-xs sm:text-sm transition-colors duration-200 hover:underline ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    {link.name}
                  </a>
                  {/* Separator for desktop */}
                  {index < legalLinks.length - 1 && (
                    <span
                      className={`hidden sm:inline text-xs sm:text-sm ${
                        darkMode ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      |
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile-specific bottom padding */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </footer>
  );
}
