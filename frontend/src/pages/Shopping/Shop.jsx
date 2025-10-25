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

      <header className="fixed top-16 left-0 right-0 z-40 flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-6 bg-white shadow-sm rounded-b-xl">
        <h1 className="text-3xl font-bold text-gray-900">WellNest Store</h1>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-none w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              style={{ backgroundColor: "#f3f4f6", color: "black" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-xl py-2 px-3 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="all">All Categories</option>
            <option value="supplements">Supplements</option>
            <option value="accessories">Accessories</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-xl py-2 px-3 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="popularity">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <button
            className="relative flex items-center border border-gray-300 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 shadow-sm transition"
            onClick={() => setCartOpen(true)}
          >
            <FiShoppingCart className="mr-2" />
            Cart ({cartCount})
          </button>

          <button
            className="flex items-center border border-gray-300 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 shadow-sm transition"
            onClick={() => navigate("/dashboard/shop/orders")}
          >
            My Orders
          </button>
        </div>
      </header>

      <div className="h-16"></div>
      <div className="h-32"></div>

      <main className="px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() => addToCart(product)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center">
            <FiFilter className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">
              No products match your filters.
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
