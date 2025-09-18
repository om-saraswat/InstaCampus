"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Grid3x3,
  List,
  Star,
  Plus,
  Minus,
  Package,
  Coffee,
  Store,
  ChevronRight,
  ChevronLeft,
  Heart,
  ShoppingCart,
  Book,
  Filter,
  SortAsc,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Hero from "./Hero"
import FilterSidebar from "./FilterSidebar";

// Enhanced product data with more realistic variety
const sampleProducts = {
  stationary: [
    {
      id: 1,
      name: "Premium Notebook Set",
      price: 299,
      originalPrice: 349,
      image:
        "https://images.unsplash.com/photo-1544716278-e513176f20a5?w=400&h=400&fit=crop",
      description:
        "High-quality ruled notebooks perfect for taking notes and assignments",
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      category: "Notebooks",
      tags: ["premium", "ruled", "study"],
    },
    {
      id: 2,
      name: "Gel Pen Pack (Blue/Black)",
      price: 150,
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop",
      description: "Smooth writing gel pens for comfortable writing experience",
      rating: 4.3,
      reviewCount: 89,
      inStock: true,
      category: "Pens",
      tags: ["gel", "smooth", "writing"],
    },
    {
      id: 3,
      name: "Scientific Calculator",
      price: 899,
      image:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop",
      description:
        "Advanced scientific calculator for mathematics and engineering students",
      rating: 4.8,
      reviewCount: 245,
      inStock: true,
      category: "Electronics",
      tags: ["scientific", "calculator", "engineering"],
    },
    {
      id: 4,
      name: "Art Supply Kit",
      price: 1299,
      originalPrice: 1599,
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
      description: "Complete art kit with colors, brushes, and drawing tools",
      rating: 4.6,
      reviewCount: 67,
      inStock: false,
      category: "Art",
      tags: ["art", "creative", "drawing"],
    },
    {
      id: 13,
      name: "Mechanical Pencil Set",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop",
      description: "Professional mechanical pencils with extra leads",
      rating: 4.4,
      reviewCount: 156,
      inStock: true,
      category: "Pencils",
      tags: ["mechanical", "professional", "precise"],
    },
  ],
  canteen: [
    {
      id: 5,
      name: "Masala Chai",
      price: 15,
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop",
      description: "Fresh aromatic masala tea with traditional spices",
      rating: 4.7,
      reviewCount: 892,
      inStock: true,
      category: "Beverages",
      tags: ["tea", "spiced", "hot"],
    },
    {
      id: 6,
      name: "Veg Sandwich",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=400&fit=crop",
      description: "Fresh vegetable sandwich with mint chutney",
      rating: 4.4,
      reviewCount: 234,
      inStock: true,
      category: "Snacks",
      tags: ["vegetarian", "fresh", "healthy"],
    },
    {
      id: 7,
      name: "Samosa (2 pieces)",
      price: 25,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop",
      description: "Crispy golden samosas with spiced potato filling",
      rating: 4.5,
      reviewCount: 567,
      inStock: true,
      category: "Snacks",
      tags: ["crispy", "spiced", "traditional"],
    },
    {
      id: 8,
      name: "Cold Coffee",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
      description: "Refreshing iced coffee with whipped cream",
      rating: 4.2,
      reviewCount: 178,
      inStock: true,
      category: "Beverages",
      tags: ["cold", "coffee", "refreshing"],
    },
    {
      id: 14,
      name: "Paneer Roll",
      price: 55,
      image:
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop",
      description: "Grilled paneer roll with fresh vegetables",
      rating: 4.6,
      reviewCount: 298,
      inStock: true,
      category: "Main Course",
      tags: ["paneer", "grilled", "filling"],
    },
  ],
  general: [
    {
      id: 9,
      name: "Hand Sanitizer (100ml)",
      price: 85,
      image:
        "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&h=400&fit=crop",
      description: "70% alcohol-based hand sanitizer for hygiene",
      rating: 4.3,
      reviewCount: 445,
      inStock: true,
      category: "Health",
      tags: ["sanitizer", "hygiene", "alcohol-based"],
    },
    {
      id: 10,
      name: "Face Masks (Pack of 10)",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=400&fit=crop",
      description: "Disposable 3-layer protective face masks",
      rating: 4.1,
      reviewCount: 234,
      inStock: true,
      category: "Health",
      tags: ["masks", "protection", "disposable"],
    },
    {
      id: 11,
      name: "Phone Charger Cable",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
      description: "Universal USB charging cable for smartphones",
      rating: 4.4,
      reviewCount: 189,
      inStock: true,
      category: "Electronics",
      tags: ["charger", "universal", "durable"],
    },
    {
      id: 12,
      name: "Umbrella",
      price: 450,
      image:
        "https://images.unsplash.com/photo-1511919478780-b3eee7b5f953?w=400&h=400&fit=crop",
      description: "Compact foldable umbrella for rainy days",
      rating: 4.0,
      reviewCount: 78,
      inStock: false,
      category: "Accessories",
      tags: ["umbrella", "foldable", "compact"],
    },
    {
      id: 15,
      name: "Power Bank 10000mAh",
      price: 899,
      originalPrice: 1199,
      image:
        "https://images.unsplash.com/photo-1609592413067-5d1084b2a278?w=400&h=400&fit=crop",
      description: "Fast charging power bank with dual USB ports",
      rating: 4.5,
      reviewCount: 312,
      inStock: true,
      category: "Electronics",
      tags: ["power bank", "fast charging", "portable"],
    },
  ],
};
const categories = [
    {
      id: "stationary",
      name: "Stationary",
      icon: Book,
      color: "from-blue-500 to-blue-600",
      description: "Books, pens, and study materials",
    },
    {
      id: "canteen",
      name: "Canteen",
      icon: Coffee,
      color: "from-orange-500 to-orange-600",
      description: "Fresh food and beverages",
    },
    {
      id: "general",
      name: "General Store",
      icon: Store,
      color: "from-green-500 to-green-600",
      description: "Daily essentials and accessories",
    },
  ];

const sortOptions = [
  { id: "featured", name: "Featured", field: "rating", order: "desc" },
  { id: "price-low", name: "Price: Low to High", field: "price", order: "asc" },
  {
    id: "price-high",
    name: "Price: High to Low",
    field: "price",
    order: "desc",
  },
  { id: "rating", name: "Highest Rated", field: "rating", order: "desc" },
  { id: "newest", name: "Newest First", field: "id", order: "desc" },
];

export default function StudentDashboard() {
  const { darkMode } = useTheme();

  const [activeCategory, setActiveCategory] = useState("stationary");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  useEffect(() => {
    setMounted(true);
    // Load cart and wishlist from localStorage with error handling
    const savedCart = localStorage.getItem("campus-cart");
    const savedWishlist = localStorage.getItem("campus-wishlist");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) || {});
      } catch (e) {
        console.error("Error loading cart:", e);
        setCart({});
      }
    }

    if (savedWishlist) {
      try {
        setWishlist(new Set(JSON.parse(savedWishlist) || []));
      } catch (e) {
        console.error("Error loading wishlist:", e);
        setWishlist(new Set());
      }
    }
  }, []);

  // Save cart and wishlist to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("campus-cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("campus-wishlist", JSON.stringify([...wishlist]));
    }
  }, [wishlist, mounted]);

  const currentProducts = useMemo(
    () => sampleProducts[activeCategory] || [],
    [activeCategory]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = currentProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(product.category);

      return matchesSearch && matchesPrice && matchesCategory;
    });

    // Sort products
    const sortOption = sortOptions.find((option) => option.id === sortBy);
    if (sortOption) {
      filtered.sort((a, b) => {
        const aVal = a[sortOption.field];
        const bVal = b[sortOption.field];

        if (sortOption.order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [currentProducts, searchTerm, priceRange, selectedCategories, sortBy]);

  const addToCart = useCallback((productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  }, []);

  const getTotalCartItems = useCallback(() => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  }, [cart]);

  const getTotalCartValue = useCallback(() => {
    return Object.entries(cart).reduce((total, [productId, count]) => {
      const product = Object.values(sampleProducts)
        .flat()
        .find((p) => p.id === parseInt(productId));
      return total + (product ? product.price * count : 0);
    }, 0);
  }, [cart]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 2000]);
    setSelectedCategories(new Set());
    setSortBy("featured");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="pt-16 flex animate-pulse">
          <div className="w-64 h-screen bg-gray-200 dark:bg-gray-800"></div>
          <div className="flex-1 p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      <Header />

      <div className="flex">
        {/* Enhanced Sidebar */}
        <Sidebar/>

        {/* Main Content */}
        <Hero/>

        {/* Filter Sidebar */}
          <FilterSidebar
    darkMode={darkMode}
    showFilters={showFilters}
    setShowFilters={setShowFilters}
    priceRange={priceRange}
    setPriceRange={setPriceRange}
    selectedCategories={selectedCategories}
    setSelectedCategories={setSelectedCategories}
    sampleProducts={sampleProducts}
  />
      </div>
    </div>
  );
}
