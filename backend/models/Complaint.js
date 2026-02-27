const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // e.g. TKT-001
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'CRITICAL'], default: 'Medium' },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], default: 'PENDING' },
    citizenId: { type: String },
    citizenName: { type: String },
    phone: { type: String },
    assignedTo: { type: String },
    department: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    imageUrl: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    is_deleted: { type: Boolean, default: false },
    // Duplicate detection features
    isDuplicate: { type: Boolean, default: false },
    parentComplaintId: { type: String, default: null },
    impactScore: { type: Number, default: 1 },
    // Critical detection features
    requiresImmediateAttention: { type: Boolean, default: false },
    slaDeadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
