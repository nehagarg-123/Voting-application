const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Otp = require('./../models/otp');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// RESEND CONFIGURATION

const { Resend } = require('resend');


const resend = new Resend(process.env.RESEND_API_KEY);

const COLLEGE_DOMAIN = "@nitjsr.ac.in";


router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Domain restriction
    if (!email.endsWith(COLLEGE_DOMAIN)) {
      return res
        .status(400)
        .json({ error: `Only emails from ${COLLEGE_DOMAIN} are allowed.` });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save / Update OTP
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode },
      { upsert: true, new: true }
    );

  
    const { error } = await resend.emails.send({
      from: 'Voting App <onboarding@resend.dev>',
      to: email,
      subject: 'OTP Verification',
      html: `
        <p>Your OTP for the Voting App is:</p>
        <h2>${otpCode}</h2>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    if (error) {
      console.error("Resend Error:", error);
      return res
        .status(500)
        .json({ error: 'Failed to send OTP email' });
    }

    res.status(200).json({
      message: 'OTP sent successfully'
    });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({
      error: 'Internal Server Error during OTP send'
    });
  }
});



router.post('/signup/verify', async (req, res) => {
  try {
    const data = req.body;

    // Allow only one admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
      return res
        .status(400)
        .json({ error: 'Admin user already exists' });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email: data.email });
    if (!otpRecord || otpRecord.otp !== data.otp) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired OTP' });
    }

    // Create user
    const newUser = new User(data);
    const response = await newUser.save();

    // Delete OTP after use
    await Otp.deleteOne({ email: data.email });

    // Generate JWT
    const token = generateToken({ id: response.id });

    res.status(200).json({
      response,
      token
    });

  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: 'Student ID or Email already registered.' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: 'Invalid email or password' });
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
