const Request = require('../models/Request');

// 1. SEND REQUEST: Captures IDs and the detailed form data from the user
exports.sendRequest = async (req, res) => {
  try {
    const { pgId, userId, ownerId, formData } = req.body;

    // Log received data for debugging the 'required' field error
    console.log("Data Received for Request:", { pgId, userId, ownerId, formData });

    // Check if a request already exists to prevent duplicates
    const existing = await Request.findOne({ pgId, userId });
    if (existing) {
      return res.status(400).json({ message: "You already sent request message" });
    }

    // Save the request with the complete formData object
    const newRequest = new Request({
      pgId,
      userId,
      ownerId,
      formData // Captures Name, Phone, Email, Occupation, etc.
    });

    await newRequest.save();

    res.status(201).json({ message: "Request sent successfully!" });

  } catch (error) {
    console.error("DETAILED ERROR:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// 2. GET USER REQUESTS: For the tenant/user to see their sent requests
exports.getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetches requests and populates PG details so the user sees the PG name
    const requests = await Request.find({ userId })
      .populate("pgId");

    res.json(requests);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching user requests",
      error: error.message
    });
  }
};

// 3. GET OWNER REQUESTS: For owners like vishava to see incoming requests
exports.getOwnerRequests = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Populates PG details and the basic requester info (niti's name/email)
    const requests = await Request.find({ ownerId })
      .populate("pgId")
      .populate("userId", "name email"); 

    res.json(requests);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching owner requests",
      error: error.message
    });
  }
};

// 4. UPDATE REQUEST STATUS: For owners to Approve or Reject a request
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects 'approved' or 'rejected'

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } // Returns the updated document to the frontend
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ 
      message: `Request ${status} successfully`, 
      request: updatedRequest 
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// 5. CANCEL REQUEST: For users to delete their pending requests
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await Request.findByIdAndDelete(id);

    res.json({
      message: "Request cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error cancelling request",
      error: error.message
    });
  }
};