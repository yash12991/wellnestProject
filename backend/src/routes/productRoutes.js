// routes/productRoutes.js
import express from "express";
import Product from "../Models/Product.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching products" });
    }
});

// GET single product by ID
// GET single product by ID with ID validation
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid product ID" });
    }
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching product" });
    }
});


export default router;
