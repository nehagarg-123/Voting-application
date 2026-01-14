const express = require('express');
const router = express.Router();
const axios = require('axios');

const User = require('./../models/user');
const Otp = require('./../models/otp');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const COLLEGE_DOMAIN = "@nitjsr.ac.in";

/* ================= SEND OTP ================= */
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!email.endsWith(COLLEGE_DOMAIN)) {
      return res.status(400).json({
        error: `Only emails from ${COLLEGE_DOMAIN} are allowed.`
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode },
      { upsert: true }
    );

    /* ✅ BREVO HTTP API (THIS WILL WORK) */
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Voting App",
          email: "noreply@brevo.com"
        },
        to: [{ email }],
        subject: "OTP Verification",
        htmlContent: `
          <p>Your OTP for the Voting App is:</p>
          <h2>${otpCode}</h2>
          <p>This OTP is valid for 5 minutes.</p>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("SEND OTP ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});


router.post('/signup/verify', async (req, res) => {
  try {
    const data = req.body;

    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
      return res.status(400).json({
        error: 'Admin user already exists'
      });
    }

    const otpRecord = await Otp.findOne({ email: data.email });
    if (!otpRecord || otpRecord.otp !== data.otp) {
      return res.status(400).json({
        error: 'Invalid or expired OTP'
      });
    }

    const newUser = new User(data);
    const response = await newUser.save();

    await Otp.deleteOne({ email: data.email });

    const token = generateToken({ id: response.id });

    res.status(200).json({
      response,
      token
    });

  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Student ID or Email already registered.'
      });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = generateToken({ id: user.id });
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
