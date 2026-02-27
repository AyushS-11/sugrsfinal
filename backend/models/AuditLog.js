const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    complaintId: { type: String },
    action: { type: String, required: true },
    actorId: { type: String },
    actorRole: { type: String },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
