import React, { useState, useEffect } from "react";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiSmartphone,
  FiMapPin,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";
import DashNav from "../../components/DashNav";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    zip: "",
    country: "India",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const token = localStorage.getItem("accessToken");
  const backendURL = `${API_URL}/v1/api/ecommerce`;

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendURL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Error loading cart");
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  // Update quantity
  const updateQuantity = async (productId, qty) => {
    if (!token || qty < 1) return;
    try {
      const res = await axios.post(
        `${backendURL}/cart/update`,
        { productId, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Error updating quantity");
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${backendURL}/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data.items || []);
      toast.info("Item removed");
    } catch (err) {
      console.error(err);
      toast.error("Error removing item");
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0),
    0
  );
  const shippingCost = subtotal > 1000 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return toast.error("Enter a coupon code");
    if (code === "SAVE10") {
      setDiscount(subtotal * 0.1);
      toast.success("Coupon applied! You saved 10%");
    } else if (code === "FREESHIP") {
      setDiscount(50);
      toast.success("Free shipping applied!");
    } else {
      setDiscount(0);
      toast.error("Invalid coupon code");
    }
  };

  const handlePlaceOrder = async () => {
    const missingField = Object.entries(shipping).find(
      ([_, value]) => !value.trim()
    );
    if (missingField) {
      toast.error(`Please fill the ${missingField[0]} field`);
      return;
    }
    if (!token) {
      toast.error("You must be logged in to place an order");
      return;
    }

    try {
      const res = await axios.post(
        `${backendURL}/orders`,
        {
          items: cart.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress: `${shipping.name}, ${shipping.address}, ${shipping.zip}, ${shipping.country}`,
          paymentMethod,
          total,
          discount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderId(res.data.orderId || res.data._id || "");
      setCart([]);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error placing order");
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <DashNav />
        <div className="text-center mt-24">
          <FiShoppingBag className="mx-auto w-24 h-24 text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">Add some items to get started</p>
          <button
            onClick={() => navigate("/dashboard/shop")}
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <DashNav />
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm p-10 text-center mt-20 max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-green-500 w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-2">Thank you for your purchase</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="font-mono text-lg font-semibold text-gray-900">
              {orderId}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/shop")}
            className="w-full px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Complete your order in a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <FiMapPin className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Shipping Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Where should we deliver?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  style={{background: 'white', color: 'black'}}
                  value={shipping.name}
                  onChange={(e) =>
                    setShipping({ ...shipping, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 outline-none transition"
                />
                <input
                  type="text"
                  placeholder="Address"
                  style={{background: 'white', color: 'black'}}
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 outline-none transition"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Pin Code"
                    style={{background: 'white', color: 'black'}}
                    value={shipping.zip}
                    onChange={(e) =>
                      setShipping({ ...shipping, zip: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 outline-none transition"
                  />
                  <input
                    type="text"
                    style={{background: 'white', color: 'black'}}
                    value={shipping.country}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <FiSmartphone className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Method
                  </h2>
                  <p className="text-sm text-gray-500">
                    Only UPI payment is available
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <FiSmartphone className="text-blue-500 w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">UPI Payment</p>
                  <p className="text-sm text-gray-600">
                    Fast & secure UPI transactions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Order Summary */}
          <div className="lg:col-span-1 m-50">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <FiShoppingBag className="text-white w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => {
                  const product = item.product || {};
                  console.log(product.image);
                  return (
                    <div
                      key={product._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
                    >
                      <img
                        src={`/assets/${product.image}`}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-gray-900 font-bold mt-1">
                          ₹{product.price?.toFixed(0)}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() =>
                              updateQuantity(product._id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <FiMinus />
                          </button>
                          <span className="w-12 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product._id, item.quantity + 1)
                            }
                            className="w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                          >
                            <FiPlus />
                          </button>
                          <button
                            onClick={() => removeItem(product._id)}
                            className="ml-auto text-red-500 hover:text-red-700 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    
                    </div>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 outline-none transition"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-6 py-3 bg-gray-900 mt-3 mb-3 text-white rounded-lg hover:bg-gray-800 transition-all font-medium whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiTruck />
                    <span>Shipping</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FiCheckCircle className="w-5 h-5" />
                Place Order
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure checkout with end-to-end encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
