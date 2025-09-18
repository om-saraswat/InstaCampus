import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function Hero({ darkMode }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/product", {
        });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Extract unique categories from DB
  const categories = [...new Set(products.map((p) => p.category))];

  // ✅ Apply filters
  let filteredAndSortedProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter((p) =>
      selectedCategories.size > 0 ? selectedCategories.has(p.category) : true
    )
    .sort((a, b) => {
      if (sortBy === "priceLowHigh") return a.price - b.price;
      if (sortBy === "priceHighLow") return b.price - a.price;
      return 0;
    });

  // ✅ Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories(new Set());
    setPriceRange([0, 2000]);
    setSortBy("");
  };

  return (
    <div className="flex">
      {/* Sidebar filters */}
      {showFilters && (
        <aside
          className={`${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border-l fixed top-16 bottom-0 w-80 p-4 z-40 overflow-y-auto`}
        >
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
                    setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
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
                    setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])
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
            {categories.map((category) => (
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
          </div>
        </aside>
      )}

      {/* Product Grid */}
      <main className="flex-1 p-4">
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedProducts.map((p) => (
              <div
                key={p._id}
                className={`border rounded-lg p-3 ${
                  darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <img
                  src={p.imgUrl}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h4
                  className={`mt-2 font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {p.name}
                </h4>
                <p className="text-sm text-gray-500">{p.category}</p>
                <p className="text-indigo-600 font-bold">₹{p.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p
            className={`text-center ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No products found
          </p>
        )}
      </main>
    </div>
  );
}
