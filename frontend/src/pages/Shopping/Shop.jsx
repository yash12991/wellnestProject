// src/pages/Shopping/Shop.jsx
import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiFilter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";
import ProductCard from "../../components/ProductCard";
import DashNav from "../../components/DashNav";
import CartDialog from "../../components/CartDialog";
import { Toaster } from "sonner"; 
import { showToast } from "../../utils/toast"; 

export default function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [cartOpen, setCartOpen] = useState(false);

  const token = localStorage.getItem("accessToken");

  // Fetch products
  const fetchProducts = async () => {
    try {
  const res = await axios.get(`${API_URL}/v1/api/ecommerce/product`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err.response?.data || err);
      showToast.error("Failed to fetch products");
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    if (!token) return;
    try {
  const res = await axios.get(`${API_URL}/v1/api/ecommerce/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Error fetching cart:", err.response?.data || err);
      setCart({ items: [] });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [token]);

  // Add to cart
  const addToCart = async (product) => {
    if (!token) return showToast.error("Please log in to add items");

    try {
      const res = await axios.post(
        `${API_URL}/v1/api/ecommerce/cart/add`,
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedCart = res.data;
      setCart(updatedCart && Array.isArray(updatedCart.items) ? updatedCart : { items: [] });
      showToast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err);
      showToast.error(err.response?.data?.message || "Error adding to cart");
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!token) return showToast.error("You must be logged in");

    try {
      const res = await axios.post(
        `${API_URL}/v1/api/ecommerce/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data || { items: [] });
      showToast.success("Item removed from cart");
    } catch (err) {
      console.error(err.response?.data || err);
      showToast.error("Error removing item from cart");
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (!token) return showToast.error("You must be logged in");

    try {
      const res = await axios.post(
        `${API_URL}/v1/api/ecommerce/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error(err.response?.data || err);
      showToast.error("Error updating quantity");
    }
  };

  // Sorting
  const getSortFunction = (sortValue) => {
    switch (sortValue) {
      case "price-low": return (a, b) => a.price - b.price;
      case "price-high": return (a, b) => b.price - a.price;
      case "rating": return (a, b) => (b.rating || 0) - (a.rating || 0);
      default: return (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort(getSortFunction(sortBy));

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" /> 

      <div className="fixed top-0 left-0 right-0 z-50">
        <DashNav />
      </div>

      <header className="bg-white shadow-lg border-b border-gray-200 mt-16">
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WellNest Store
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{filteredProducts.length}</span>
              <span>Products</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              style={{ backgroundColor: "#f9fafb" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm sm:text-base text-gray-900 placeholder-gray-500"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 min-w-[140px] border border-gray-300 rounded-xl py-2.5 px-3 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm font-medium text-gray-700"
            >
              <option value="all">All Categories</option>
              <option value="supplements">Supplements</option>
              <option value="accessories">Accessories</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 min-w-[140px] border border-gray-300 rounded-xl py-2.5 px-3 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm font-medium text-gray-700"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              className="flex-1 flex items-center justify-center border-2 border-indigo-600 px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 shadow-sm transition text-sm font-semibold text-indigo-600"
              onClick={() => setCartOpen(true)}
            >
              <FiShoppingCart className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Cart</span> ({cartCount})
            </button>

            <button
              className="flex-1 flex items-center justify-center border-2 border-gray-300 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 shadow-sm transition text-sm font-semibold text-gray-700"
              onClick={() => navigate("/dashboard/shop/orders")}
            >
              <span className="hidden xs:inline">My</span> Orders
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() => addToCart(product)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center border border-gray-100">
            <FiFilter className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold text-lg mb-1">
              No products found
            </p>
            <p className="text-gray-400 text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </main>

      {cartOpen && (
        <CartDialog
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          backendURL={API_URL}
          cart={cart}
          setCart={setCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        >
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate("/dashboard/shop/checkout")}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </CartDialog>
      )}
    </div>
  );
}
