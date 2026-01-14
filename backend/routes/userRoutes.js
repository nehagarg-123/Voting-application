const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Otp = require('./../models/otp');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');


const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER, 
    pass: process.env.BREVO_SMTP_PASS  // SMTP KEY
  }
});

const COLLEGE_DOMAIN = "@nitjsr.ac.in";


router.post('/signup/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

   
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    /* Domain restriction */
    if (!email.endsWith(COLLEGE_DOMAIN)) {
      return res.status(400).json({
        error: `Only emails from ${COLLEGE_DOMAIN} are allowed.`
      });
    }

    /* Check if user already exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    /* Generate OTP */
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    /* Save / Update OTP */
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode },
      { upsert: true }
    );

   
    await transporter.sendMail({
      from: "Voting App <noreply@brevo.com>", // no domain purchase needed
      to: email,
      subject: "OTP Verification",
      html: `
        <p>Your OTP for the Voting App is:</p>
        <h2>${otpCode}</h2>
        <p>This OTP is valid for 5 minutes.</p>
      `
    });

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
