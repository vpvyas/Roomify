const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'owner'], 
    default: 'user' // Default to tenant, updated to 'host' if they register as owner
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PG' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);