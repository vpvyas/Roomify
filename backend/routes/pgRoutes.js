const express = require("express");
const router = express.Router();
const PG = require("../models/pgSchema");

// ✅ Add PG Form Page
router.get("/add", (req, res) => {
  res.render("init");
});

// ✅ Save PG Data
router.post("/", async (req, res) => {
  try {
    req.body.amenities = req.body.amenities.split(",");
    req.body.images = req.body.images.split(",");
    req.body.rules = req.body.rules.split(",");

    const newPG = new PG(req.body);
    await newPG.save();
    res.redirect("/pg/all");
  } catch (err) {
    console.log(err);
    res.send("Error saving PG");
  }
});


// ✅ Show All PGs
router.get("/all", async (req, res) => {
  const pgs = await PG.find();
  res.json(pgs);
});

// ✅ Show Single PG
router.get("/:id", async (req, res) => {
  const pg = await PG.findById(req.params.id);
  res.json(pg);
});


module.exports = router;
