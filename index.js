const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

console.log("Environment variables loaded:");
console.log("USER_MONGODB_URI:", process.env.USER_MONGODB_URI);
const mongoUri = process.env.USER_MONGODB_URI || "mongodb://mongo-user:27017/users";
console.log("Connecting to MongoDB:", mongoUri);
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

const User = mongoose.model("User", {
  username: String,
  password: String
});

// Register
app.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashed
    });
    res.json({ id: user._id, username: user.username });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).send("User not found");

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user._id }, "SECRET_KEY");
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(5001, () => {
  console.log("User Service running on port 5001");
});
