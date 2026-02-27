const express = require('express');
const router = express.Router();
const { models: { Complaint, AuditLog } } = require('../db');

// GET all notification logs (simplified — showing audit trail of status changes)
router.get('/log', async (req, res) => {
    try {
        const logs = await AuditLog.find({ action: { $in: ['UPDATE', 'RESOLVE', 'ESCALATE'] } })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: 'Audit log failed' });
    }
});

module.exports = router;
