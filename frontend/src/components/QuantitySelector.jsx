// src/components/QuantitySelector.jsx
import React from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

export default function QuantitySelector({
  quantity,
  setQuantity,
  min = 1,
  max = 99,
}) {
  const increment = () => {
    if (quantity < max) setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > min) setQuantity(quantity - 1);
  };

  const handleChange = (e) => {
    const value = parseInt(e.target.value) || min;
    setQuantity(Math.max(min, Math.min(max, value)));
  };

  return (
    <div className="flex items-center border rounded-lg overflow-hidden w-max">
      <button
        onClick={decrement}
        disabled={quantity <= min}
        className={`px-3 py-1 transition-colors ${
          quantity <= min
            ? "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
        aria-label="Decrease quantity"
      >
        <FiMinus className="w-4 h-4" />
      </button>

      <input
        type="number"
        value={quantity}
        min={min}
        max={max}
        onChange={handleChange}
        className="w-12 text-center border-l border-r outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <button
        onClick={increment}
        disabled={quantity >= max}
        className={`px-3 py-1 transition-colors ${
          quantity >= max
            ? "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
        aria-label="Increase quantity"
      >
        <FiPlus className="w-4 h-4" />
      </button>
    </div>
  );
}
