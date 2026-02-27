const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
    complaintId: { type: String, required: true },
    status: { type: String, required: true },
    note: { type: String },
    date: { type: String }, // Storing as YYYY-MM-DD to match current seed format
}, { timestamps: true });

module.exports = mongoose.model('Timeline', TimelineSchema);
