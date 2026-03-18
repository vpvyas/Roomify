const express = require("express");
const router = express.Router();
const multer = require("multer");
const PG = require("../models/pgSchema");
const Review = require("../models/reviewSchema"); // Added this
const { storage } = require("../cloudConfig.js");
const { registerUser, loginUser } = require('../controller/authController');
const protect = require('../middleware/authMiddleware'); // Fixed import (no curly braces)

const upload = multer({ storage });

// AUTH ROUTES
router.post('/register', registerUser);
router.post('/login', loginUser);

// PG MANAGEMENT ROUTES
router.post('/add', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, city, state, location, price, availableRooms, totalRooms, amenities, rules, ownerId } = req.body;
    const images = req.files ? req.files.map(file => ({ url: file.path, filename: file.filename })) : [];
    const newPG = new PG({
      name, description, address: { city, state, location },
      price: Number(price), availableRooms: Number(availableRooms), totalRooms: Number(totalRooms),
      images, amenities: amenities ? JSON.parse(amenities) : [],
      rules: rules ? JSON.parse(rules) : [], owner: ownerId 
    });
    await newPG.save();
    res.status(201).json({ success: true, data: newPG });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const pgs = await PG.find().populate("owner", "name email");
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all PGs" });
  }
});
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const pgs = await PG.find({ owner: req.params.ownerId });
        res.json(pgs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching PGs" });
    }
});
router.get("/:id", async (req, res) => {
  try {
    // Populate reviews AND the user inside each review
    const pg = await PG.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name' }
      });
    if (!pg) return res.status(404).json({ message: "PG not found" });
    res.status(200).json(pg);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// REVIEW ROUTE
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, message } = req.body;
  try {
    const pg = await PG.findById(req.params.id);
    if (pg) {
      const alreadyReviewed = await Review.findOne({ user: req.user._id, pg: req.params.id });
      if (alreadyReviewed) return res.status(400).json({ message: 'You already reviewed this PG' });

      const review = new Review({
        user: req.user._id,
        pg: req.params.id,
        rating: Number(rating),
        message,
      });

      await review.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'PG not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id)
      .populate('owner', 'name email') // Populates PG owner
      .populate({
        path: 'reviews',
        populate: {
          path: 'user', // This looks inside the Review model
          select: 'name' // Only grab the user's name
        }
      });

    if (!pg) return res.status(404).json({ message: "PG not found" });
    res.status(200).json(pg);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;