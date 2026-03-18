const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const protect = require('../middleware/authMiddleware'); 

// GET: Fetch requests for the logged-in Owner
router.get('/owner-requests', protect, async (req, res) => {
    try {
        // Find bookings where 'owner' field equals the logged-in user's ID
        const requests = await Booking.find({ owner: req.user.id })
            .populate('user', 'name email') // Get Guest's name/email
            .populate('room', 'name price') // Get PG's name/price
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;