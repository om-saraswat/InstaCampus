"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize with default false (light mode) to avoid SSR mismatch
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage on client-side after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      let initialDarkMode = false;

      if (savedTheme) {
        // Handle legacy non-JSON values ("dark" or "light")
        if (savedTheme === "dark") {
          initialDarkMode = true;
        } else if (savedTheme === "light") {
          initialDarkMode = false;
        } else {
          try {
            initialDarkMode = JSON.parse(savedTheme);
          } catch (e) {
            console.warn(
              "Invalid theme value in localStorage, defaulting to light mode:",
              e.message
            );
          }
        }
        setDarkMode(initialDarkMode);
      }

      // Apply dark class to document
      if (initialDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []); // Empty dependency array: runs once after mount

  // Persist theme to localStorage when darkMode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
