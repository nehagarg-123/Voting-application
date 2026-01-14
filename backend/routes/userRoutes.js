const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

const User = require('./../models/user');
const Otp = require('./../models/otp');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

const COLLEGE_DOMAIN = "@nitjsr.ac.in";

/* ================= SMTP CONFIG (BREVO) ================= */
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

/* ================= SEND OTP ================= */
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!email.endsWith(COLLEGE_DOMAIN)) {
      return res.status(400).json({
        error: `Only emails from ${COLLEGE_DOMAIN} are allowed`
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists"
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode },
      { upsert: true }
    );

    await transporter.sendMail({
      from: '"Voting App" <nehagarg6201@gmail.com>',
      to: email,
      subject: "OTP Verification",
      html: `
        <p>Your OTP for the Voting App is:</p>
        <h2>${otpCode}</h2>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

/* ================= VERIFY OTP & SIGNUP ================= */
router.post('/signup/verify', async (req, res) => {
  try {
    const data = req.body;

    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
      return res.status(400).json({
        error: "Admin user already exists"
      });
    }

    const otpRecord = await Otp.findOne({ email: data.email });
    if (!otpRecord || otpRecord.otp !== data.otp) {
      return res.status(400).json({
        error: "Invalid or expired OTP"
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
        error: "Student ID or Email already registered"
      });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ================= LOGIN ================= */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = generateToken({ id: user.id });
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ================= PROFILE ================= */
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ================= CHANGE PASSWORD ================= */
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Both currentPassword and newPassword are required"
      });
    }

    const user = await User.findById(userId);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        error: "Invalid current password"
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
