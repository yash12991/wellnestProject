// src/components/CartItem.jsx
import React from "react";
import QuantitySelector from "./QuantitySelector";
import { FiTrash2 } from "react-icons/fi";

export default function CartItem({ item, updateQuantity, removeItem }) {
  const productId = item.product?._id;
  const name = item.product?.name || "Unnamed Product";
  const image =
    item.image ||
    (item.product?.image
      ? item.product.image.startsWith("http")
        ? item.product.image
        : `/assets/${item.product.image}`
      : "https://via.placeholder.com/100");
  const price = item.product?.price || 0;
  const quantity = item.quantity || 1;

  

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg shadow-sm gap-4 hover:shadow-md transition">
      {/* Product Image */}
      <img
        src={image}
        alt={name}
        className="w-24 h-24 object-cover rounded-lg"
      />

      {/* Product Info */}
      <div className="flex-1 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 md:gap-4 w-full">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-gray-500 mt-1">₹{price.toFixed(2)}</p>
        </div>

        {/* Quantity Selector */}
        <QuantitySelector
          quantity={quantity}
          setQuantity={(q) => updateQuantity(productId, q)}
          min={1}
        />
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(productId)}
        className="text-red-500 hover:text-red-700 p-2 rounded-lg transition hover:bg-red-50"
        aria-label="Remove item"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
