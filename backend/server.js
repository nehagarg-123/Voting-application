const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const db = require('./db');
const Candidate = require('./models/candidate');


app.use(cors({
  origin: true,              
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');
});


const emitResults = async () => {
  try {
    const candidates = await Candidate.find();
    const results = {};
    candidates.forEach(c => {
      results[c.name] = c.voteCount;
    });
    io.emit("update_results", results);
  } catch (err) {
    console.error("Error emitting results:", err);
  }
};

setInterval(emitResults, 5000);

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require("./routes/adminRoutes");

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);
app.use('/vote', voteRoutes);
app.use('/admin', adminRoutes);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
