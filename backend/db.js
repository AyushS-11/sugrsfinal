const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sugrs';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('🍃 Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Timeline = require('./models/Timeline');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');
const CivicAction = require('./models/CivicAction');

async function seedIfEmpty() {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        console.log('🌱 Seeding database...');
        const SEED_USERS = [
            { name: 'Priya Sharma', email: 'priya@sugrs.in', password: 'citizen123', role: 'citizen', citizenId: 'C001' },
            { name: 'Amit Kumar', email: 'amit@sugrs.in', password: 'citizen123', role: 'citizen', citizenId: 'C002' },
            { name: 'Rajan Mehta', email: 'rajan@sugrs.in', password: 'officer123', role: 'officer', citizenId: 'O001', department: 'Water' },
            { name: 'Neha Verma', email: 'neha@sugrs.in', password: 'officer123', role: 'officer', citizenId: 'O002', department: 'Streetlight' },
            { name: 'Suresh Nair', email: 'suresh@sugrs.in', password: 'officer123', role: 'officer', citizenId: 'O003', department: 'Road' },
            { name: 'System Admin', email: 'admin@sugrs.in', password: 'admin123', role: 'admin' },
        ];
        await User.insertMany(SEED_USERS);
        console.log('✅ Seeding complete');
    }
}
seedIfEmpty();

// ─── Legacy Compatibility (Optional) ───
// We export these to help transition, but routes should move to using models directly.
const store = {
    users: [],
    complaints: [],
    timeline: [],
    feedback: [],
    auditLogs: [],
    civicActions: [],
    civicPoints: {},
};

// Sync legacy helpers (to be phased out)
async function addTimeline(complaintId, status, note, date) {
    const entry = new Timeline({ complaintId, status, note, date });
    return await entry.save();
}

async function attachTimeline(complaint) {
    const timeline = await Timeline.find({ complaintId: complaint.id });
    return { ...complaint.toObject(), timeline };
}

async function addCivicPoints(citizenId, delta, citizenName = 'Citizen') {
    let user = await User.findOne({ citizenId });
    if (!user) {
        user = new User({
            citizenId,
            name: citizenName,
            email: `${citizenId}@anon.sugrs.local`,
            password: Math.random().toString(36),
            role: 'citizen',
            points: 0
        });
    }
    user.points = (user.points || 0) + delta;
    await user.save();
}

async function getLeaderboard(limit = 5) {
    return await User.find({ role: 'citizen' })
        .sort({ points: -1 })
        .limit(limit)
        .select('citizenId points name');
}

// Global store proxy (DANGEROUS: deprecated, use models instead)
// This is here just to avoid immediate crashes if some code still expects `store.complaints`
// But we won't populate it. We will refactor routes instead.

module.exports = {
    mongoose,
    models: { User, Complaint, Timeline, Feedback, AuditLog, CivicAction },
    // Helpers
    addTimeline,
    attachTimeline,
    addCivicPoints,
    getLeaderboard,
    // DEPRECATED (will be removed once routes are refactored)
    store,
    save: () => { console.log('⚠️ db.save() called but no longer needed with MongoDB'); }
};
