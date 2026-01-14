const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Otp = require('./../models/otp');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//  NEW EMAIL CONFIGURATION (Using Resend API)
const { Resend } = require('resend');
// Ensure you add RESEND_API_KEY to your Render Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

const COLLEGE_DOMAIN = "@nitjsr.ac.in";

// ROUTE 1: SEND OTP

router.post('/signup/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Check Domain restriction
        if (!email.endsWith(COLLEGE_DOMAIN)) {
            return res.status(400).json({ error: `Only emails from ${COLLEGE_DOMAIN} are allowed.` });
        }

        // 2. Check if Email already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // 3. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Save OTP to Database (Upsert)
        await Otp.findOneAndUpdate(
            { email: email },
            { otp: otpCode },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 5. Send Email via Resend API (HTTPS)
        const { data, error } = await resend.emails.send({
            from: 'Voting App <onboarding@resend.dev>', 
            to: email,
            subject: 'Verification Code',
            html: `<p>Your One-Time Password (OTP) for the Voting App is: <strong>${otpCode}</strong>. It expires in 5 minutes.</p>`
        });

        if (error) {
            console.error("Resend Error:", error);
            return res.status(400).json({ error: 'Failed to send OTP email via API.' });
        }

        res.status(200).json({ message: 'OTP sent successfully via Resend API.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error during OTP send.' });
    }
});


// ROUTE 2:VERIFY OTP & CREATE ACCOUNT

router.post('/signup/verify', async (req, res) => {
    try {
        const data = req.body;

        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        const otpRecord = await Otp.findOne({ email: data.email });
        if (!otpRecord || otpRecord.otp !== data.otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const newUser = new User(data);
        const response = await newUser.save();

        await Otp.deleteOne({ email: data.email });

        const payload = { id: response.id };
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Student ID or Email already registered.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// LOGIN AND PROFILE ROUTES (Remains the same as your original)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or Password' });
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
