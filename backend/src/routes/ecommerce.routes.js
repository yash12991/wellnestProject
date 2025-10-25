import express from "express";
import { addToCart, getCart, removeCartItem, updateCartItem, createOrder, getOrders } from "../controllers/users.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import Product from "../Models/Product.js";


const router = express.Router();

// PUBLIC route to get all products
// Public products route
router.get("/product", async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching products" });
    }
});

// GET single product by ID (public)
router.get("/product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching product" });
    }
});

// GET products by category
router.get("/products", async (req, res) => {
    try {
        const category = req.query.category;
        let filter = {};
        if (category) filter.category = category;
        const products = await Product.find(filter);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching products" });
    }
});



// Protect the rest of the routes
router.use(verifyJWT);

// Add product to cart
router.post("/cart/add", addToCart);

// Get current user's cart
router.get("/cart", getCart);

// Remove product from cart
router.post("/cart/remove", removeCartItem);
router.post("/cart/update", updateCartItem);
router.post("/orders", verifyJWT, createOrder);
router.get("/orders", verifyJWT, getOrders);


export default router;
