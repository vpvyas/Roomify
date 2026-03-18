const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to keep the secret consistent
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

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
      role: role || 'user'
    });

    await newUser.save();

    // 4. Generate Token for Auto-Login
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Send data back (including email so frontend dashboard can show it)
    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Role Verification
    // This ensures users don't log into the Owner Dashboard and vice-versa
    if (user.role !== role) {
      return res.status(403).json({
        message: `Account not registered as ${role}. Please select the correct role.`
      });
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Return consistent user object
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("DETAILED LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

module.exports = { registerUser, loginUser };