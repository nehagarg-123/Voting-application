const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

// --- SCHEDULER LOGIC ---
const Election = require('./models/election');

const checkElectionStatus = async () => {
    try {
        const election = await Election.findOne();
        if (!election) return;

        const now = new Date();
        let currentStatus = election.status;
        let newStatus = currentStatus;

        if (now >= election.startDate && now < election.endDate && currentStatus !== 'live') {
            newStatus = 'live';
        } else if (now >= election.endDate && currentStatus !== 'completed') {
            newStatus = 'completed';
        }

        if (newStatus !== currentStatus) {
            election.status = newStatus;
            await election.save();
            io.emit('electionStatusUpdated', { status: newStatus });
            console.log(`Election status changed to: ${newStatus}`);
        }
    } catch (err) {
        console.error('Error checking election status:', err);
    }
};

// Check status every 30 seconds
setInterval(checkElectionStatus, 30 * 1000);
// --- END SCHEDULER ---

// Import routers
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const electionRoutes = require('./routes/electionRoutes'); // New

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);
app.use('/election', electionRoutes); // New

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

module.exports = { io }; // Export for use in other files