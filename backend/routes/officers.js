const express = require('express');
const router = express.Router();
const { models: { User, Complaint } } = require('../db');

// GET officers overview for Admin
router.get('/', async (req, res) => {
    try {
        const officers = await User.find({ role: 'officer' }).lean();
        const enriched = await Promise.all(officers.map(async o => {
            const complaints = await Complaint.find({ assignedTo: o.name, is_deleted: false });
            return {
                ...o,
                complaintsCount: complaints.length,
                pendingCount: complaints.filter(c => c.status === 'PENDING').length,
                resolvedCount: complaints.filter(c => c.status === 'RESOLVED').length
            };
        }));
        res.json(enriched);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch officers' });
    }
});

module.exports = router;
