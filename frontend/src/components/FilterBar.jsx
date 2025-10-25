// src/components/FilterBar.jsx
import React, { useState } from "react";

export default function FilterBar({ categories, onFilter }) {
  const [selected, setSelected] = useState("All");

  const handleChange = (category) => {
    setSelected(category);
    // Send category in lowercase for consistent filtering
    onFilter(category.toLowerCase());
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {["All", ...categories].map((cat) => (
        <button
          key={cat}
          onClick={() => handleChange(cat)}
          className={`
            px-4 py-2 rounded-full border font-medium text-sm transition 
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${
              selected === cat
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }
          `}
          aria-pressed={selected === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
