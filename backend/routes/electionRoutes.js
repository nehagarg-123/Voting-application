const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const User = require('../models/user');
const Election = require('../models/election');

// Helper function to check for admin role
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// POST route to schedule or update an election (Admin only)
router.post('/schedule', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'User does not have admin role' });

        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Both startDate and endDate are required.' });
        }

        // --- THIS IS THE FIX ---
        // Get the 'io' object from the app instance attached to the request
        const io = req.app.get('socketio');

        let election = await Election.findOne();
        if (election) {
            election.startDate = startDate;
            election.endDate = endDate;
            election.status = 'pending';
        } else {
            election = new Election({ startDate, endDate });
        }
        
        const response = await election.save();
        
        // Announce the schedule update to all clients
        if (io) {
            io.emit('electionScheduled', response);
        }
        
        console.log('Election schedule updated');
        res.status(200).json({ message: 'Election scheduled successfully', response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET route to fetch the current election schedule and status
router.get('/status', async (req, res) => {
    try {
        const election = await Election.findOne();
        if (!election) {
            return res.status(404).json({ message: 'No election has been scheduled.' });
        }
        res.status(200).json(election);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Simple GET /election to return basic info or redirect to /status
router.get('/', (req, res) => {
  res.redirect('/election/status');
});

module.exports = router;