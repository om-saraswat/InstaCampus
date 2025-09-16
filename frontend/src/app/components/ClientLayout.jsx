"use client";
import { useTheme } from "../context/ThemeProvider";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
