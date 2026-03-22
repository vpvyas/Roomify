const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "my_secret_key_123";
      const decoded = jwt.verify(token, secret);

      // We look for .id or ._id depending on how you signed the token
      const userId = decoded.id || decoded._id;
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("JWT ERROR:", error.message);
      return res.status(401).json({ message: "Token invalid: " + error.message });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token found in headers" });
  }
};

module.exports = protect;