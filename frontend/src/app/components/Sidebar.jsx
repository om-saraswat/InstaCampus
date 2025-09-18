
import React from "react";
import { ChevronRight, ChevronLeft, ShoppingCart, Heart } from "lucide-react";
import { categories, sampleProducts } from "../data/sampleProducts";

export default function Sidebar({
  darkMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeCategory,
  setActiveCategory,
  cart,
  wishlist,
  getTotalCartItems,
  getTotalCartValue,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  clearFilters,
}) {
  const getIconComponent = (iconName) => {
    const iconMap = {
      Book: require("lucide-react").Book,
      Coffee: require("lucide-react").Coffee,
      Store: require("lucide-react").Store,
    };
    return iconMap[iconName] || require("lucide-react").Store;
  };

  return (
    <aside
      className={`${sidebarCollapsed ? "w-16" : "w-80"} ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-r transition-all duration-300 ease-in-out flex flex-col h-auto sticky top-16 z-30 overflow-y-auto`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {!sidebarCollapsed && (
          <div>
            <h2
              className={`font-bold text-lg ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Campus Store
            </h2>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Everything you need on campus
            </p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode
              ? "hover:bg-gray-700 text-gray-400 hover:text-white"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          }`}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3
          className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
            sidebarCollapsed ? "text-center" : ""
          } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {sidebarCollapsed ? "•••" : "Categories"}
        </h3>

        {categories.map((category) => {
          const Icon = getIconComponent(category.icon);
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group mb-2 ${
                isActive
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                  : darkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={sidebarCollapsed ? category.name : ""}
            >
              <Icon
                className={`w-5 h-5 ${sidebarCollapsed ? "mx-auto" : ""}`}
              />
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{category.name}</div>
                  <div
                    className={`text-xs ${
                      isActive ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {category.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Enhanced Stats */}
      {!sidebarCollapsed && (
        <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`p-4 rounded-xl ${
              darkMode
                ? "bg-gradient-to-r from-gray-700 to-gray-600"
                : "bg-gradient-to-r from-gray-50 to-gray-100"
            } border ${darkMode ? "border-gray-600" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Shopping Cart
              </span>
              <ShoppingCart className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {getTotalCartItems()} items
              </span>
              <span className={`text-lg font-semibold text-green-600`}>
                ₹{getTotalCartValue()}
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              darkMode
                ? "bg-gradient-to-r from-red-900/20 to-pink-900/20"
                : "bg-gradient-to-r from-red-50 to-pink-50"
            } border ${darkMode ? "border-red-800" : "border-red-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Wishlist
              </span>
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <span
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {wishlist.size} items
            </span>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {!sidebarCollapsed && (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-xs font-semibold uppercase tracking-wider ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className={`text-xs px-2 py-1 rounded ${
                darkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Clear
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="2000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([
                      parseInt(e.target.value) || 0,
                      priceRange[1],
                    ])
                  }
                  className={`w-full px-2 py-1 text-xs rounded border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      parseInt(e.target.value) || 2000,
                    ])
                  }
                  className={`w-full px-2 py-1 text-xs rounded border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Categories
            </label>
            {Object.values(sampleProducts)
              .flat()
              .reduce((acc, product) => {
                if (!acc.includes(product.category)) acc.push(product.category);
                return acc;
              }, [])
              .map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-2 mb-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedCategories);
                      if (e.target.checked) {
                        newSelected.add(category);
                      } else {
                        newSelected.delete(category);
                      }
                      setSelectedCategories(newSelected);
                    }}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {category}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </aside>
  );
}