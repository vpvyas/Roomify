const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token); // DEBUG LINE

      const secret = process.env.JWT_SECRET || "my_secret_key_123";
      const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("JWT VERIFICATION ERROR:", error.message); // Will show 'jwt expired' or 'invalid signature'
      return res.status(401).json({ message: "Token invalid: " + error.message });
    }
  } else {
      return res.status(401).json({ message: "Not authorized, no token found in headers" });
  }
};

module.exports = protect; // Exporting the function directly