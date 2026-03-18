const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controller/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: "Welcome dashboard", user: req.user });
});

module.exports = router;