const express = require('express');
const router = express.Router();
const { models: { Feedback, Complaint } } = require('../db');

// GET public reviews
router.get('/public', async (req, res) => {
    try {
        const feedback = await Feedback.find({ visibleOnMainPage: true, isHidden: false })
            .sort({ createdAt: -1 })
            .limit(12);
        res.json(feedback);
    } catch (e) {
        res.status(500).json({ error: 'Feedback fetch failed' });
    }
});

// GET stats
router.get('/stats', async (req, res) => {
    try {
        const all = await Feedback.find({ isHidden: false });
        const total = all.length;
        if (total === 0) return res.json({ total: 0, avg: 0, dist: [0, 0, 0, 0, 0] });

        const avg = Math.round((all.reduce((s, f) => s + f.rating, 0) / total) * 10) / 10;
        const dist = [1, 2, 3, 4, 5].map(r => all.filter(f => f.rating === r).length);
        res.json({ total, avg, dist });
    } catch (e) {
        res.status(500).json({ error: 'Stats failed' });
    }
});

// POST feedback
router.post('/', async (req, res) => {
    try {
        const { complaintId, rating, comment, citizenName } = req.body;
        if (!complaintId || !rating) return res.status(400).json({ error: 'complaintId and rating required' });

        const complaint = await Complaint.findOne({ id: complaintId, is_deleted: false });
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        if (complaint.status !== 'RESOLVED') return res.status(400).json({ error: 'Only allowed for RESOLVED complaints' });

        const existing = await Feedback.findOne({ complaintId, citizenName: citizenName || 'Anonymous' });
        if (existing) return res.status(409).json({ error: 'Feedback already submitted' });

        const entry = new Feedback({
            id: 'FB-' + Date.now(),
            complaintId,
            complaintTitle: complaint.title,
            complaintCategory: complaint.category,
            rating: Number(rating),
            comment: comment?.trim().slice(0, 500),
            citizenName: citizenName?.trim() || 'Anonymous Citizen',
            visibleOnMainPage: Number(rating) >= 3,
            isHidden: false
        });

        await entry.save();
        complaint.citizenRating = Number(rating);
        await complaint.save();

        res.status(201).json({ success: true, feedback: entry });
    } catch (e) {
        res.status(500).json({ error: 'Submission failed' });
    }
});

module.exports = router;
