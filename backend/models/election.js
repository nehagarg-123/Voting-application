const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'live', 'completed'],
        default: 'pending',
    }
});

const Election = mongoose.model('Election', electionSchema);
module.exports = Election;