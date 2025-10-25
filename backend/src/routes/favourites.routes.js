import express from "express";
import Favourite from "../Models/Favourites.model.js";

const router = express.Router();

// ➕ Add favourite
router.post("/:userId/favourites", async (req, res) => {
  try {
    const { userId } = req.params;
    const { dishName, tags, calories, recipe } = req.body;

    // Check if this dish already exists for the user
    const exists = await Favourite.findOne({ userId, dishName });
    if (exists)
      return res.status(400).json({ message: "Dish already in favourites" });

    const favourite = new Favourite({ userId, dishName, tags, calories, recipe });
    await favourite.save();

    res.status(200).json({ message: "Added to favourites", favourite });
  } catch (err) {
    console.error("Error adding favourite:", err);
    res.status(500).json({ message: "Failed to add favourite", error: err.message });
  }
});

// ➖ Remove favourite
router.delete("/:userId/favourites/:dishName", async (req, res) => {
  try {
    const { userId, dishName } = req.params;

    await Favourite.findOneAndDelete({ userId, dishName });

    res.status(200).json({ message: "Removed from favourites" });
  } catch (err) {
    console.error("Error removing favourite:", err);
    res.status(500).json({ message: "Failed to remove favourite", error: err.message });
  }
});

// 🧾 Get all favourites
router.get("/:userId/favourites", async (req, res) => {
  try {
    const { userId } = req.params;
    const favourites = await Favourite.find({ userId });
    res.status(200).json({ favourites });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch favourites", error: err.message });
  }
});

export default router;
