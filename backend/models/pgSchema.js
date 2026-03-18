const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: {
    city: String,
    state: String,
    location: String 
  },
  amenities: [{ type: String }],
  price: { type: Number, required: true },
  availableRooms: { type: Number, required: true },
  totalRooms: { type: Number, required: true },
  images: [{ url: String, path: String }],
  rules: [{ type: String }],
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  // This part is crucial for Virtuals to show up in your frontend
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- ADDED VIRTUAL CONNECTION ---
// This creates a "fake" field called 'reviews' that Mongoose fills 
// by looking at the Review collection for matching PG IDs.
pgSchema.virtual('reviews', {
  ref: 'Review',          // The name of your Review model
  localField: '_id',      // The ID of the PG
  foreignField: 'pg'      // The field in the Review model that stores the PG ID
});

module.exports = mongoose.model('PG', pgSchema);