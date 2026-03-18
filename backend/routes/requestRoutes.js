const express = require('express');
const router = express.Router();
// Import the whole controller object
const requestController = require('../controller/requestController');

// Debugging line: This will show in your terminal which functions are actually loaded
console.log("Loaded Controller Functions:", Object.keys(requestController));

// Route to send a request (Now expects pgId, userId, and ownerId)
router.post('/send', requestController.sendRequest);

// Route to get requests for a specific USER (For niti's dashboard)
router.get('/user/:userId', requestController.getUserRequests);

// NEW: Route to get requests for a specific OWNER (For vishava's dashboard)
router.get('/owner/:ownerId', requestController.getOwnerRequests);

// Route to cancel a request
router.delete('/:id', requestController.cancelRequest);
// routes/requestRoutes.js
router.put('/:id/status', requestController.updateRequestStatus);// New route
module.exports = router;