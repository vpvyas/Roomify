const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Fixed syntax
    ref: "User",
    required: true
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PG",
    required: true
  },
  rating: {
    type: Number, // Fixed "Number" to Number
    required: true,
    min: 1,
    max: 5
  },
  message: {
    type: String, // Fixed "String" and "tyoe"
    required: true
  },
  createdAt: { // Changed to camelCase (Standard)
    type: Date,
    default: Date.now // Just Date.now, not Date.now()
  }
});

module.exports = mongoose.model("Review", reviewSchema);