import React from "react";
import { Star, Heart, Plus, Minus } from "lucide-react";

export default function ProductCard({
  product,
  darkMode,
  viewMode,
  cart,
  wishlist,
  addToCart,
  removeFromCart,
  toggleWishlist,
}) {
  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 ${
        viewMode === "grid"
          ? "hover:scale-105"
          : "flex items-center space-x-4 p-4"
      } group relative`}
    >
      {/* Discount Badge */}
      {product.originalPrice && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          {Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100
          )}
          % OFF
        </div>
      )}

      {/* Product Image */}
      <div
        className={`relative ${
          viewMode === "grid" ? "aspect-square" : "w-24 h-24 flex-shrink-0"
        } overflow-hidden ${viewMode === "grid" ? "" : "rounded-lg"}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
            wishlist.has(product.id)
              ? "bg-red-500 text-white shadow-lg scale-110"
              : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110"
          }`}
          style={{ zIndex: 20 }}
        >
          <Heart
            className={`w-4 h-4 ${
              wishlist.has(product.id) ? "fill-current" : ""
            }`}
          />
        </button>

        {/* Stock Status */}
        {!product.inStock && (
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
            style={{ zIndex: 10 }}
          >
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View on Hover */}
        {viewMode === "grid" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`${viewMode === "grid" ? "p-4" : "flex-1"}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              } ${
                viewMode === "grid" ? "text-lg" : "text-base"
              } leading-tight mb-1 line-clamp-2`}
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {product.rating}
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <p
          className={`text-sm mb-3 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          } ${viewMode === "grid" ? "line-clamp-2" : "line-clamp-1"}`}
        >
          {product.description}
        </p>

        {/* Tags */}
        {viewMode === "grid" && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-full text-xs ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span
                  className={`text-lg line-through ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {product.category}
            </span>
          </div>

          {/* Enhanced Cart Controls */}
          <div className="flex items-center space-x-2">
            {cart[product.id] ? (
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className={`font-semibold min-w-[2rem] text-center ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {cart[product.id]}
                </span>
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={!product.inStock}
                  className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
