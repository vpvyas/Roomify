const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const app = express();
require('dotenv').config();
const cors = require("cors");
app.use(cors());
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.json());   // ⭐ REQUIRED for React/axios

// Routes
const pgRoutes = require("./routes/pgRoutes");
app.use("/pg", pgRoutes);
app.use("/api/users", pgRoutes);

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/rommify")
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
