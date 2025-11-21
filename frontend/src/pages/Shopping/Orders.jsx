import React, { useEffect, useState } from "react";
import { FiPackage, FiCheckCircle, FiTruck, FiClock } from "react-icons/fi";
import DashNav from "../../components/DashNav";
import axios from "axios";
import { API_URL } from "../../utils/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendURL = API_URL; // backend base URL

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${backendURL}/v1/api/ecommerce/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Now items.product contains name and image from populate
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        const stored = JSON.parse(localStorage.getItem("orders")) || [];
        setOrders(stored);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-800", icon: <FiCheckCircle /> };
      case "shipped":
      case "in transit":
        return { bg: "bg-blue-100", text: "text-blue-800", icon: <FiTruck /> };
      case "pending":
      case "processing":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: <FiClock /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: <FiPackage /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashNav />
        <div className="text-center mt-24 space-y-4">
          <FiPackage className="mx-auto w-16 h-16 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800">No Orders Yet</h2>
          <p className="text-gray-500">
            Your order history will appear here after checkout.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard/shop")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashNav />
      <div className="max-w-5xl mx-auto p-6 space-y-8 pt-20">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Orders</h1>

        {orders.map((order) => {
          const badge = getStatusBadge(order.status);
          const createdAt = order.createdAt || order.date;
          const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          const orderTotal =
            order.total ??
            order.items.reduce(
              (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
              0
            );

          return (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-md hover:shadow-lg transition"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                <h2 className="font-semibold text-lg text-gray-800">
                  Order #{order._id.slice(-6)}
                </h2>
                <span className="text-gray-500">{formattedDate}</span>
                <span
                  className={`mt-2 md:mt-0 px-4 py-1 text-sm rounded-full flex items-center gap-1 font-medium ${badge.bg} ${badge.text}`}
                >
                  {badge.icon} {order.status || "Processing"}
                </span>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 space-y-3 max-h-96 overflow-y-auto">
                {order.items.map((item, index) => {
                  const product = item.product || {};
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center text-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={`/assets/${product.image || "placeholder.png"}`}
                          alt={product.name || "Product"}
                          className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-4">
                <span className="font-bold text-lg text-gray-800">Total:</span>
                <span className="font-bold text-lg text-gray-900">
                  ₹{orderTotal.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
