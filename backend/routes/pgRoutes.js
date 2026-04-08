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
    // 1. Find the existing PG record
    const pg = await PG.findById(req.params.id);
    if (!pg) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 2. Parse JSON strings sent from Frontend FormData
    // FormData sends everything as strings, so we must parse arrays/objects
    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : pg.images;
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    const rules = req.body.rules ? JSON.parse(req.body.rules) : [];

    // 3. Handle Image Deletion from Cloudinary
    // We find images currently in DB that are NOT in the 'existingImages' list sent from UI
    const imagesToDelete = pg.images.filter(
      (oldImg) => !existingImages.some((keptImg) => keptImg.filename === oldImg.filename)
    );

    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map((img) => cloudinary.uploader.destroy(img.filename))
      );
      console.log(`${imagesToDelete.length} images deleted from Cloudinary`);
    }

    // 4. Process New Uploads (if any)
    const newUploadedFiles = req.files.map((file) => ({
      url: file.path,       // Cloudinary URL
      filename: file.filename // Cloudinary Public ID
    }));

    // 5. Combine: Kept Images + New Images
    const finalImagesArray = [...existingImages, ...newUploadedFiles];

    // 6. Construct the update object
    // Note: We manually reconstruct the 'address' object from the flat fields
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      address: {
        city: req.body.city,
        state: req.body.state,
        location: req.body.location,
      },
      price: Number(req.body.price),
      totalRooms: Number(req.body.totalRooms),
      availableRooms: Number(req.body.availableRooms),
      amenities: amenities,
      rules: rules,
      images: finalImagesArray,
    };

    // 7. Save to Database
    const updatedPG = await PG.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedPG,
    });

  } catch (error) {
    console.error("Update API Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during update", 
      error: error.message 
    });
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