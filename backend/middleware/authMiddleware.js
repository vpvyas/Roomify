const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from "Bearer TOKEN"
      token = req.headers.authorization.split(" ")[1];

      const secret = process.env.JWT_SECRET || "my_secret_key_123";
      const decoded = jwt.verify(token, secret);

      // Attach user to request (optional but best practice)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log("JWT ERROR:", error);
      return res.status(401).json({ message: "Token invalid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;