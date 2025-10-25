// src/components/CartDialog.jsx
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "sonner";
import { showToast } from "../utils/toast"; 

export default function CartDialog({ isOpen, onClose, backendURL, token }) {
  const navigate = useNavigate();
  const userToken = token || localStorage.getItem("accessToken");

  const [cart, setCart] = useState({ items: [], total: 0 });
  const cartItems = Array.isArray(cart.items) ? cart.items : [];

  // Fetch cart
  const fetchCart = async () => {
    if (!userToken) return;
    try {
      const res = await axios.get(`${backendURL}/v1/api/ecommerce/cart`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setCart(res.data || { items: [], total: 0 });
    } catch (err) {
      console.error("Fetch Cart Error:", err.response?.data || err.message);
      showToast.error("Error fetching cart");
    }
  };

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (!userToken) return showToast.error("You must be logged in");
    if (quantity < 1) return removeItem(productId);

    try {
      await axios.post(
        `${backendURL}/v1/api/ecommerce/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      showToast.success("Quantity updated");
      await fetchCart();
    } catch (err) {
      console.error("Update Quantity Error:", err.response?.data || err.message);
      showToast.error(err.response?.data?.error || "Error updating quantity");
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    if (!userToken) return showToast.error("You must be logged in");

    try {
      await axios.post(
        `${backendURL}/v1/api/ecommerce/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      showToast.success("Item removed");
      await fetchCart();
    } catch (err) {
      console.error("Remove Item Error:", err.response?.data || err.message);
      showToast.error(err.response?.data?.error || "Error removing item");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Toaster richColors position="top-center" /> 

      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition"
          aria-label="Close cart"
        >
          <FiX size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-wide">
          My Cart
        </h2>

        {/* Items */}
        {cartItems.length === 0 ? (
          <p className="text-gray-400 italic text-center py-20">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {cartItems.map((item) => {
              const productId = item.product?._id;
              return (
                <CartItem
                  key={productId}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              );
            })}
          </div>
        )}

        {/* Total & Checkout */}
        {cartItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-bold text-lg text-gray-900">
              Total: ₹{cart.total?.toFixed(0) || 0}
            </span>
            <button
              className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
              onClick={() => {
                navigate("/dashboard/shop/checkout");
                onClose();
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
