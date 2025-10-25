// src/pages/Shopping/Product.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";
import ProductCard from "../../components/ProductCard";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import DashNav from "../../components/DashNav";
import CartDialog from "../../components/CartDialog";
import { Toaster } from "sonner"; 
import { showToast } from "../../utils/toast"; 

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const [relatedProducts, setRelatedProducts] = useState([]);

  const token = localStorage.getItem("accessToken");
  const backendURL = API_URL;

  // Fetch single product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${backendURL}/v1/api/ecommerce/product/${id}`);
        const prod = res.data;
        setProduct(prod);

        // Related products
        if (prod.category) {
          try {
            const relatedRes = await axios.get(
              `${backendURL}/v1/api/ecommerce/products?category=${prod.category}`
            );
            setRelatedProducts(
              relatedRes.data.filter((p) => p._id !== id)
            );
          } catch (err) {
            console.error("Error fetching related products:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, backendURL]);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${backendURL}/v1/api/ecommerce/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data || { items: [] });
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, [token, backendURL]);

  // Add product to cart
  const handleAddToCart = async (prod = product, qty = quantity) => {
    if (!prod) return showToast.error("Product not found");
    if (!token) return showToast.error("Please log in to add items");
    if (qty < 1) return showToast.error("Quantity must be at least 1");

    try {
      const res = await axios.post(
        `${backendURL}/v1/api/ecommerce/cart/add`,
        { productId: prod._id, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data || { items: [] });
      showToast.success(`${prod.name} added to cart!`);
      setCartOpen(false);
    } catch (err) {
      console.error(err);
      showToast.error(err.response?.data?.error || "Error adding to cart");
    }
  };

  // Update quantity
  const updateQuantity = async (productId, qty) => {
    if (!token || qty < 1) return;
    try {
      const res = await axios.post(
        `${backendURL}/v1/api/ecommerce/cart/update`,
        { productId, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error(err);
      showToast.error("Error updating quantity");
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!token) return showToast.error("You must be logged in");
    try {
      const res = await axios.post(
        `${backendURL}/v1/api/ecommerce/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data || { items: [] });
      showToast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      showToast.error("Error removing item");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-12 text-gray-600 font-semibold">
        Loading product...
      </p>
    );

  if (!product)
    return (
      <p className="text-center mt-12 text-red-500 font-semibold">
        Product not found!
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" /> 
      <DashNav />
      <div className="max-w-5xl mx-auto px-6 mt-20">
        <button
          className="mb-6 text-indigo-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          ← Back to Shop
        </button>

        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-lg shadow p-6">
          <img
            src={
              product.image?.startsWith("http")
                ? product.image
                : `${backendURL}/assets/${product.image || "placeholder.png"}`
            }
            alt={product.name}
            className="w-full md:w-1/2 h-96 object-cover rounded-lg shadow"
          />

          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600">{product.brand}</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-600">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-gray-700">{product.description}</p>

            <div className="flex items-center gap-4 mt-4">
              <label className="font-medium">Quantity:</label>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 border rounded px-2 py-1"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleAddToCart()}
                disabled={!product.inStock}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-semibold transition ${
                  product.inStock
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <FiShoppingCart />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                <FiHeart />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onAddToCart={() => handleAddToCart(p, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {cartOpen && (
        <CartDialog
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          setCart={setCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      )}
    </div>
  );
}
