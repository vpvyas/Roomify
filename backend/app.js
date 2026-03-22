const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path"); 
const app = express();

require('dotenv').config();
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // or your frontend port
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // <--- THIS IS THE FIX
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
// This MUST be placed before your routes
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ✅ STATIC FOLDER
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const pgRoutes = require("./routes/pgRoutes");
const userRoute = require("./routes/userRoutes");
const bookRoute = require("./routes/bookingRoutes"); // Matches routes/booking.js
const requestRoutes = require('./routes/requestRoutes');
const receiptRoutes = require('./routes/receiptRoutes'); // Path to your routes file

app.use("/pg", pgRoutes);
app.use("/api/users", userRoute);
app.use("/api/bookings", bookRoute); 
app.use('/api/requests', requestRoutes)
app.use('/api/receipts', receiptRoutes); 
// Database name matches your previous setup
mongoose.connect("mongodb://127.0.0.1:27017/rommify")
.then(() => console.log("✅ Mongo Connected"))
.catch(err => console.log("❌ Mongo Error:", err));
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});