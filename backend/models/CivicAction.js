const mongoose = require('mongoose');

const CivicActionSchema = new mongoose.Schema({
    complaintId: { type: String, required: true },
    citizenId: { type: String, required: true },
    citizenName: { type: String },
    type: { type: String, enum: ['upvote', 'volunteer', 'citizen_resolve', 'comment'], required: true },
    comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CivicAction', CivicActionSchema);
