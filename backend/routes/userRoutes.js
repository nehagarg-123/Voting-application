const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Otp = require('./../models/otp'); // Import the new OTP model
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const nodemailer = require('nodemailer');

// 📧 EMAIL CONFIGURATION (Using Gmail)
// ⚠️ You should ideally put these in a .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Reads from .env
        pass: process.env.EMAIL_PASS  // Reads from .env
    }
});
// 🔒 CONFIG: Change this to your college domain
const COLLEGE_DOMAIN = "@nitjsr.ac.in"; // Example: @iitb.ac.in


// ----------------------------------------------------
// ROUTE 1: SEND OTP
// ----------------------------------------------------
router.post('/signup/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Check Domain restriction
        if (!email.endsWith(COLLEGE_DOMAIN)) {
            return res.status(400).json({ error: `Only emails from ${COLLEGE_DOMAIN} are allowed.` });
        }

        // 2. Check if Email already exists in User DB
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // 3. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Save OTP to Database (Upsert: Update if exists, Insert if new)
        await Otp.findOneAndUpdate(
            { email: email },
            { otp: otpCode },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 5. Send Email
        const mailOptions = {
            from: 'Voting App Admin',
            to: email,
            subject: 'Verification Code',
            text: `Your One-Time Password (OTP) for the Voting App is: ${otpCode}. It expires in 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully to your email.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send OTP. Internal Server Error' });
    }
});


// ----------------------------------------------------
// ROUTE 2: VERIFY OTP & CREATE ACCOUNT
// ----------------------------------------------------
router.post('/signup/verify', async (req, res) => {
    try {
        const data = req.body; // Contains name, email, password, studentId, otp

        // 1. Check if there is already an admin user (Security Check)
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // 2. Verify OTP
        const otpRecord = await Otp.findOne({ email: data.email });
        if (!otpRecord) {
            return res.status(400).json({ error: 'OTP expired or verify the email again.' });
        }
        if (otpRecord.otp !== data.otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // 3. Create a new User document
        // Note: studentId and role should be in 'data'
        const newUser = new User(data);

        // 4. Save the new user to the database
        const response = await newUser.save();
        console.log('User saved successfully');

        // 5. Delete the used OTP
        await Otp.deleteOne({ email: data.email });

        // 6. Generate JWT token
        const payload = {
            id: response.id
        }
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.error(err);
        // Handle Duplicate Student ID Error specifically
        if (err.code === 11000 && err.keyPattern && err.keyPattern.studentId) {
            return res.status(400).json({ error: 'Student ID already registered.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ----------------------------------------------------
// LOGIN ROUTE (Unchanged)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or Password' });
        }
        const payload = { id: user.id }
        const token = generateToken(payload);
        res.json({ token })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ----------------------------------------------------
// PROFILE ROUTES (Unchanged)
// ----------------------------------------------------
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }
        const user = await User.findById(userId);
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }
        user.password = newPassword;
        await user.save();
        console.log('password updated');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
