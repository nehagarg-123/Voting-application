
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with role 'admin'
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
