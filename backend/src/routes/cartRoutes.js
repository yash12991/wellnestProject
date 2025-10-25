import express from "express";
import { Cart, Product } from "../models/ecommerceModels.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// GET Cart for logged-in user
// ================================
router.get("/", authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart) return res.json({ items: [], total: 0 });

        // Compute total
        cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// POST: Add product to cart
// ================================
router.post("/add", authMiddleware, async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [{ product: productId, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.populate("items.product");
        // Update total
        cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
        await cart.save();

        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// POST: Remove item from cart
// ================================
router.post("/remove", authMiddleware, async (req, res) => {
    const { productId } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.items = cart.items.filter((i) => i.product.toString() !== productId);

        await cart.populate("items.product");
        cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
        await cart.save();

        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// POST: Update quantity
// ================================
router.post("/update", authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ error: "Item not found in cart" });

        if (quantity <= 0) {
            // Remove item if quantity is zero or less
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.populate("items.product");
        cart.total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
        await cart.save();

        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
