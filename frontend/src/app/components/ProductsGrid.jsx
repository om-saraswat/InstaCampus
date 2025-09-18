import React from "react";
import { Package } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductsGrid({
  darkMode,
  viewMode,
  filteredAndSortedProducts,
  clearFilters,
  cart,
  wishlist,
  addToCart,
  removeFromCart,
  toggleWishlist,
}) {
  if (filteredAndSortedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package
          className={`w-20 h-20 mb-4 ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <h3
          className={`text-2xl font-semibold mb-2 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          No products found
        </h3>
        <p
          className={`text-center mb-4 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          We couldn't find any products matching your criteria.
          <br />
          Try adjusting your search terms or filters.
        </p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          : "space-y-4"
      }`}
    >
      {filteredAndSortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          darkMode={darkMode}
          viewMode={viewMode}
          cart={cart}
          wishlist={wishlist}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          toggleWishlist={toggleWishlist}
        />
      ))}
    </div>
  );
}
