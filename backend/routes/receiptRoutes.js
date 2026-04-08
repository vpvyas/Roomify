const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const { cloudinary } = require('../cloudConfig'); 

router.post('/generate', async (req, res) => {
  try {
    const { signature, ...receiptData } = req.body;
    
    // 1. Handle Signature Upload to Cloudinary
    let signatureUrl = "";
    if (signature && signature.startsWith("data:image")) {
       const uploadRes = await cloudinary.uploader.upload(signature, {
        folder: "Roomify/signatures",
      });
      signatureUrl = uploadRes.secure_url;
    }

    // 2. CRITICAL: Map flat fields to the nested 'charges' object
    const chargesObject = {
      water: Number(receiptData.water_charges || 0),
      electricity: Number(receiptData.electricity_charges || 0),
      tax: Number(receiptData.tax_charges || 0)
    };

    const newReceipt = new Receipt({
      owner: receiptData.owner,
      ownerId: receiptData.ownerId,
      requestId: receiptData.requestId,
      receipt_no: receiptData.receipt_no || `REC-${Date.now()}`,
      date: receiptData.date || new Date(),
      tenant_name: receiptData.tenant_name,
      property_address: receiptData.property_address,
      rent_amount: Number(receiptData.rent_amount),
      charges: chargesObject, // PACKED OBJECT
      total_amount: Number(receiptData.total_amount),
      signature: signatureUrl
    });

    const saved = await newReceipt.save();
    res.status(201).json({ success: true, receipt: saved });

  } catch (err) {
    console.error("❌ Backend Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Used by User Dashboard to find receipt by Request ID
router.get('/request/:requestId', async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ requestId: req.params.requestId });
    if (!receipt) return res.status(404).json({ message: "Not found" });
    res.status(200).json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;