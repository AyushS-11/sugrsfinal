const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    complaintId: { type: String, required: true },
    complaintTitle: { type: String },
    complaintCategory: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    citizenName: { type: String, default: 'Anonymous Citizen' },
    visibleOnMainPage: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
