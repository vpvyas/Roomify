const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and Save the User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user' // Ensures the role is set correctly during registration
    });

    await newUser.save();

    res.status(201).json({ 
      message: "User registered successfully!",
      user: { id: newUser._id, name: newUser.name, role: newUser.role }
    });

  } catch (error) {
     console.log("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(403).json({ 
        message: `Account not registered as ${role}. Please select the correct role.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if secret exists, otherwise provide a fallback for testing
    const secret = process.env.JWT_SECRET || 'my_secret_key_123';

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      secret, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error("DETAILED LOGIN ERROR:", error); // This shows in your terminal
    res.status(500).json({ message: "Server error", details: error.message });
  }
};
module.exports = { registerUser ,loginUser};