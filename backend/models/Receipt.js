const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  receipt_no: { type: String, required: true, unique: true }, // Direct field
  date: { type: Date, default: Date.now },
  tenant_name: { type: String, required: true },
  property_address: { type: String, required: true },
  rent_amount: { type: Number, required: true },
  charges: {
    water: { type: Number, default: 0 },
    electricity: { type: Number, default: 0 },
    tax: { type: Number, default: 0 }
  },
  total_amount: { type: Number, required: true },
  signature: { type: String, default: "" }
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', ReceiptSchema);
module.exports = Receipt;