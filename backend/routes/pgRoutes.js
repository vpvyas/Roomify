const express = require("express");
const router = express.Router();
const multer = require("multer");
const PG = require("../models/pgSchema");
const Review = require("../models/reviewSchema");
// Destructure both cloudinary and storage from your config
const { cloudinary, storage } = require("../cloudConfig.js"); 
const { registerUser, loginUser } = require('../controller/authController');
const protect = require('../middleware/authMiddleware'); 
const upload = multer({ storage });

const Request = require('../models/Request'); // ✅ MUST IMPORT THIS
const Receipt = require('../models/Receipt'); // ✅ MUST IMPORT THIS

// AUTH ROUTES
router.post('/register', registerUser);
router.post('/login', loginUser);

// PG MANAGEMENT ROUTES
router.post('/add', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, city, state, location, price, availableRooms, totalRooms, amenities, rules, ownerId } = req.body;
    
    // You are saving it as 'filename' here
    const images = req.files ? req.files.map(file => ({ 
      url: file.path, 
      filename: file.filename 
    })) : [];

    const newPG = new PG({
      name, description, address: { city, state, location },
      price: Number(price), availableRooms: Number(availableRooms), totalRooms: Number(totalRooms),
      images, 
      amenities: amenities ? JSON.parse(amenities) : [],
      rules: rules ? JSON.parse(rules) : [], 
      owner: ownerId 
    });
    await newPG.save();
    res.status(201).json({ success: true, data: newPG });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.put("/update/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    const { existingImages } = req.body; // Sent as a JSON string from frontend
    const parsedExisting = JSON.parse(existingImages || "[]");

    // ✅ Find images that were REMOVED by the user
    const imagesToDelete = pg.images.filter(
      oldImg => !parsedExisting.some(newImg => newImg.filename === oldImg.filename)
    );

    // ✅ Wipe them from Cloudinary
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map(img => cloudinary.uploader.destroy(img.filename)));
    }

    // ... continue with your update logic (saving new images, etc.)
  } catch (err) { /* error handling */ }
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
    if (!pg) return res.status(404).json({ message: 'PG not found' });

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
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// backend/routes/pgRoutes.js
 // ✅ MUST BE DESTRUCTURED

// DELETE PG: http://localhost:3000/pg/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pg = await PG.findById(id);

    if (!pg) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // ✅ 1. CLOUDINARY DESTROY LOGIC
    if (pg.images && pg.images.length > 0) {
      const deletePromises = pg.images.map(async (img) => {
        if (img.filename) {
          console.log("Deleting Image ID:", img.filename); // DEBUG LOG
          const result = await cloudinary.uploader.destroy(img.filename);
          console.log("Cloudinary Result:", result); // DEBUG LOG
          return result;
        }
      });
      await Promise.all(deletePromises);
    }

    // 2. Cascade Delete Requests & Receipts
    const associatedRequests = await Request.find({ pgId: id });
    const requestIds = associatedRequests.map(r => r._id);
    await Receipt.deleteMany({ requestId: { $in: requestIds } });
    await Request.deleteMany({ pgId: id });

    // 3. Delete PG Record
    await PG.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "DB and Cloudinary cleaned up" });
  } catch (error) {
    console.error("DELETE CRASH:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});


module.exports = router;