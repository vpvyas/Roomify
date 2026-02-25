const express = require("express");
const router = express.Router();
const PG = require("../models/pgSchema");

// Import your auth controllers to fix the ReferenceError
// Assuming your controller file is in ../controller/authController
const { registerUser, loginUser } = require('../controller/authController');

// ✅ POST: Add a new PG (For AddPG.jsx)
router.post('/add', async (req, res) => {
    try {
        const { 
            name, description, address, amenities, 
            price, availableRooms, totalRooms, 
            images, rules, ownerId 
        } = req.body;

        const newPG = new PG({
            name,
            description,
            address,      // Received as object {city, state, location}
            amenities,    // Received as array
            price,
            availableRooms,
            totalRooms,
            images,
            rules,        // Received as array
            owner: ownerId
        });

        const savedPG = await newPG.save();
        res.status(201).json({ success: true, data: savedPG });
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ✅ GET: Fetch PGs for a specific owner (For OwnerDashboard.jsx)
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const pgs = await PG.find({ owner: req.params.ownerId });
        res.json(pgs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching PGs" });
    }
});

// ✅ Auth Routes (Moved inside here since you had them, now with imports fixed)
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ GET: Show All PGs for Home Page
router.get("/all", async (req, res) => {
    try {
        const pgs = await PG.find().populate("owner", "name email");
        res.json(pgs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching all PGs" });
    }
});

// ✅ GET: Show Single PG Details
router.get("/:id", async (req, res) => {
    try {
        const pg = await PG.findById(req.params.id);
        if (!pg) return res.status(404).json({ message: "PG not found" });
        res.json(pg);
    } catch (err) {
        res.status(500).json({ message: "Error fetching PG" });
    }
});

module.exports = router;