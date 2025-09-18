import React from "react";
import { X } from "lucide-react";
<<<<<<< HEAD
import { sampleProducts } from "../data/sampleProducts";

export default function FilterSidebar({
=======

function FilterSidebar({
>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
  darkMode,
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
<<<<<<< HEAD
}) {
  if (!showFilters) return null;

=======
  sampleProducts,
}) {
  if (!showFilters) return null;

  // get unique categories from sampleProducts
  const uniqueCategories = Object.values(sampleProducts)
    .flat()
    .reduce((acc, product) => {
      if (!acc.includes(product.category)) acc.push(product.category);
      return acc;
    }, []);

>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
  return (
    <aside
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-l fixed top-16 bottom-0 w-80 p-4 transition-all duration-300 ease-in-out z-40 overflow-y-auto`}
    >
<<<<<<< HEAD
=======
      {/* Header */}
>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Filters
        </h3>
        <button
          onClick={() => setShowFilters(false)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
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
<<<<<<< HEAD
                setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
=======
                setPriceRange([
                  parseInt(e.target.value) || 0,
                  priceRange[1],
                ])
>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
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
<<<<<<< HEAD
                setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])
=======
                setPriceRange([
                  priceRange[0],
                  parseInt(e.target.value) || 2000,
                ])
>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
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
<<<<<<< HEAD
        {Object.values(sampleProducts)
          .flat()
          .reduce((acc, product) => {
            if (!acc.includes(product.category)) acc.push(product.category);
            return acc;
          }, [])
          .map((category) => (
            <div key={category} className="flex items-center space-x-2 mb-2">
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
=======
        {uniqueCategories.map((category) => (
          <div key={category} className="flex items-center space-x-2 mb-2">
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
>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
      </div>
    </aside>
  );
}
<<<<<<< HEAD
=======

export default FilterSidebar;
>>>>>>> a6d82530bd172e7179f93804be06f3a7d4157093
