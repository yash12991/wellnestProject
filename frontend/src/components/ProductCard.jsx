// src/components/ProductCard.jsx
import React from "react";
import { API_URL } from '../utils/api';
import { FiShoppingCart, FiStar, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product = {}, onAddToCart }) {
  const navigate = useNavigate();

  const backendURL = API_URL; // Backend URL

  const productId = product._id || "unknown";
  const productImg = product.image;
  const productName = product.name || "Unnamed Product";
  const productBrand = product.brand || "Brand";
  const productPrice = product.price?.toFixed(2) || "0.00";
  const productRating = product.rating || 0;
  const productReviews = product.reviews || 0;
  const inStock = product.inStock ?? true;
  const isPopular = product.isPopular ?? false;

  // Build full image URL from backend
  const productImage = product.image
    ? `${backendURL}/assets/${productImg}`
    : `${backendURL}/assets/placeholder.png`;

  const navigateToProduct = () => {
    navigate(`/dashboard/shop/product/${productId}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative cursor-pointer" onClick={navigateToProduct}>
        <img
          src={productImage}
          alt={productName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${backendURL}/assets/placeholder.png`;
          }}
          className="w-full h-56 sm:h-64 md:h-72 lg:h-60 xl:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isPopular && (
          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
            Popular
          </span>
        )}
        <button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-gray-700 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add to Wishlist"
        >
          <FiHeart className="h-4 w-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded-full">
            {productBrand}
          </span>
          <span
            className={`font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <h3
          className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 truncate"
          onClick={navigateToProduct}
        >
          {productName}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description || "No description available."}
        </p>

        <div className="flex items-center gap-1 text-xs">
          <FiStar className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-gray-800">{productRating}</span>
          <span className="text-gray-500">({productReviews})</span>
        </div>

        <div className="flex items-center justify-between pt-1.5">
          <span className="text-lg font-bold text-indigo-600">
            Rs.{productPrice}
          </span>
          <button
            onClick={onAddToCart}
            disabled={!inStock}
            className={`flex items-center px-3 py-1 rounded-lg text-white font-medium text-xs transition-colors ${
              inStock
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            aria-label={inStock ? "Add to Cart" : "Notify Me"}
          >
            <FiShoppingCart className="mr-1 h-3.5 w-3.5" />
            {inStock ? "Add" : "Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}
