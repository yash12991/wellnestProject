import mongoose from "mongoose";

// ================================
// Product Schema
// ================================
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

// ================================
// Cart Schema
// ================================
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
    total: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

// ================================
// Order Schema
// ================================
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // snapshot of product price
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered"],
      default: "pending",
    },
    shippingAddress: { type: String },
    paymentMethod: { type: String }, // optional for now
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export { Product, Cart, Order };
