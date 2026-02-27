const express = require('express');
const router = express.Router();
const { store } = require('../db');
const { getAuditTrail } = require('../lib/auditService');
const { verifyComplaintIntegrity } = require('../lib/hashUtils');
const { requireAuth } = require('../middleware/authMiddleware');

// Get full audit trail for a complaint
router.get('/:complaintId', requireAuth(['officer', 'admin']), (req, res) => {
    const { complaintId } = req.params;

    // Check if complaint exists (even if it's soft-deleted)
    const complaint = store.complaints.find(c => c.id === complaintId);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const trail = getAuditTrail(complaintId);
    res.json(trail);
});

// Verify audit chain integrity for a complaint
router.get('/:complaintId/verify', requireAuth(['officer', 'admin']), (req, res) => {
    const { complaintId } = req.params;

    const complaint = store.complaints.find(c => c.id === complaintId);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const result = verifyComplaintIntegrity(complaintId, store.auditLogs || []);

    if (result.valid) {
        res.json({
            status: 'SECURE',
            message: 'All records verified successfully.',
            details: result
        });
    } else {
        res.status(409).json({
            status: 'COMPROMISED',
            message: 'Hash chain broken. Potential tampering detected.',
            details: result
        });
    }
});

module.exports = router;
