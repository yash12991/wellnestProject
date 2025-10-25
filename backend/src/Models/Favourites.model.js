import mongoose from "mongoose";

const favoriteDishSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dishName: { type: String, required: true },
  calories: { type: Number },
  recipe: { type: String },
  cuisine: { type: String, default: "Indian" },
  tags: [String], // e.g. ["vegetarian", "breakfast", "high protein"]
  addedAt: { type: Date, default: Date.now },
});

const Favorite = mongoose.model("FavoriteDish", favoriteDishSchema);
export default Favorite;
