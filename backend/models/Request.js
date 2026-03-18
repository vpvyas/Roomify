const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  // Detailed information for the owner to review
  formData: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    occupation: { type: String, required: true },
    moveInDate: { type: Date, required: true },
    stayDuration: { type: String, required: true },
    message: { type: String }
  },
  requestedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Request', RequestSchema);