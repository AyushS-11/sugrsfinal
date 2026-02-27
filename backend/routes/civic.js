const express = require('express');
const router = express.Router();
const { models: { Complaint, CivicAction, User }, addCivicPoints, getLeaderboard } = require('../db');

// GET feed
router.get('/feed', async (req, res) => {
    try {
        const complaints = await Complaint.find({ is_deleted: false, status: { $ne: 'REJECTED' } }).limit(20).sort({ createdAt: -1 });
        const enriched = await Promise.all(complaints.map(async c => {
            const actions = await CivicAction.find({ complaintId: c.id });
            return {
                ...c.toObject(),
                upvotes: actions.filter(a => a.type === 'upvote').length,
                volunteers: actions.filter(a => a.type === 'volunteer').map(a => a.citizenName),
                voted: false // Frontend will handle per-user voted status
            };
        }));
        res.json(enriched);
    } catch (e) {
        res.status(500).json({ error: 'Feed failed' });
    }
});

// GET leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const board = await getLeaderboard(5);
        res.json(board);
    } catch (e) {
        res.status(500).json({ error: 'Leaderboard failed' });
    }
});

// GET points
router.get('/points/:citizenId', async (req, res) => {
    try {
        const user = await User.findOne({ citizenId: req.params.citizenId });
        res.json({ points: user ? user.points : 0 });
    } catch (e) {
        res.status(500).json({ error: 'Points lookup failed' });
    }
});

// POST upvote
router.post('/upvote/:id', async (req, res) => {
    try {
        const { citizenId } = req.body;
        const complaint = await Complaint.findOne({ id: req.params.id });
        if (!complaint) return res.status(404).json({ error: 'Not found' });

        const existing = await CivicAction.findOne({ complaintId: req.params.id, citizenId, type: 'upvote' });
        if (existing) return res.status(400).json({ error: 'Already upvoted' });

        const action = new CivicAction({ complaintId: req.params.id, citizenId, type: 'upvote' });
        await action.save();
        await addCivicPoints(citizenId, 2);

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Upvote failed' });
    }
});

// POST volunteer
router.post('/volunteer/:id', async (req, res) => {
    try {
        const { citizenId, citizenName } = req.body;
        const complaint = await Complaint.findOne({ id: req.params.id });
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

        const existing = await CivicAction.findOne({ complaintId: req.params.id, citizenId, type: 'volunteer' });
        if (existing) return res.status(400).json({ error: 'Already volunteering' });

        const action = new CivicAction({ complaintId: req.params.id, citizenId, citizenName, type: 'volunteer' });
        await action.save();
        await addCivicPoints(citizenId, 10, citizenName);

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Volunteer failed' });
    }
});

// POST resolve (citizen-led)
router.post('/resolve/:id', async (req, res) => {
    try {
        const { citizenId, citizenName, note } = req.body;
        const complaint = await Complaint.findOne({ id: req.params.id });
        if (!complaint) return res.status(404).json({ error: 'Not found' });

        const action = new CivicAction({ complaintId: req.params.id, citizenId, citizenName, type: 'citizen_resolve', comment: note });
        await action.save();
        await addCivicPoints(citizenId, 25, citizenName);

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Resolve failed' });
    }
});

// POST comment
router.post('/comment/:id', async (req, res) => {
    try {
        const { citizenId, citizenName, text } = req.body;
        const action = new CivicAction({ complaintId: req.params.id, citizenId, citizenName, type: 'comment', comment: text });
        await action.save();
        await addCivicPoints(citizenId, 5, citizenName);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Comment failed' });
    }
});

module.exports = router;
