const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'officer', 'supervisor', 'admin'], default: 'citizen' },
    citizenId: { type: String, sparse: true }, // Optional for citizens/officers
    department: { type: String, default: null }, // Only for officers
    points: { type: Number, default: 0 }, // Civic points for leaderboard
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
