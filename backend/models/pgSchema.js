const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },

  description: { 
    type: String, 
    required: true 
  },

  address: {
    city: String,
    state: String,
    location: String   // full address or area name
  },

  amenities: [{ 
    type: String        // e.g. "WiFi", "AC", "Parking"
  }],

  price: { 
    type: Number, 
    required: true 
  },

  availableRooms: { 
    type: Number, 
    required: true 
  },

  totalRooms: { 
    type: Number, 
    required: true 
  },

  images: [{ 
    type: String        // image URLs or file paths
  }],

  rules: [{ 
    type: String        // e.g. "No smoking"
  }],

  isAvailable: { 
    type: Boolean, 
    default: true 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('PG', pgSchema);
