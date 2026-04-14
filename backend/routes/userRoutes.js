const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controller/authController");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");
const PG = require("../models/pgSchema");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: "Welcome dashboard", user: req.user });
});

// Add to favorites
router.post("/:userId/favorites/:pgId", protect, async (req, res) => {
  try {
    const { userId, pgId } = req.params;

    // Check if PG exists
    const pg = await PG.findById(pgId);
    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    // Add to favorites if not already added
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.favorites.includes(pgId)) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    user.favorites.push(pgId);
    await user.save();

    res.status(200).json({ message: "Added to favorites", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete("/:userId/favorites/:pgId", protect, async (req, res) => {
  try {
    const { userId, pgId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== pgId);
    await user.save();

    res.status(200).json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all favorites
router.get("/:userId/favorites", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;