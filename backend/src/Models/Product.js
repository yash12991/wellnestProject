import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    imageUrl: { type: String, required: true, trim: true },
    inStock: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Check if model already exists, else create
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
